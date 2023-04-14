const express = require('express');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

const FILE_PATH = __dirname + '/data.json';

async function readTickets() {
  try {
    const data = await fs.readFile(FILE_PATH);
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function writeTickets(tickets) {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(tickets));
  } catch (err) {
    console.error(err);
  }
}

// Middleware to parse request bodies
app.use(express.json());

// Endpoint to get all tickets
app.get('/rest/list', async (req, res) => {
  try {
    const tickets = await readTickets();
    res.send(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});

// Endpoint to get a single ticket by id
app.get('/rest/ticket/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tickets = await readTickets();
    const ticket = tickets.find((t) => t.id === id);

    if (!ticket) {
      res.status(404).send('Ticket not found');
    } else {
      res.send(ticket);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});

// Endpoint to create a new ticket
app.post('/rest/ticket', async (req, res) => {
  try {
    const tickets = await readTickets();
    const ticket = req.body;
    ticket.id = Date.now(); // Assign a unique id
    tickets.push(ticket);
    console.log(`Created ticket with id ${ticket.id}`);

    await writeTickets(tickets);

    res.send(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});

// Endpoint to update an existing ticket by id
app.put('/rest/ticket/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tickets = await readTickets();
    const index = tickets.findIndex((t) => t.id === id);

    if (index === -1) {
      res.status(404).send('Ticket not found');
    } else {
      tickets[index] = { ...tickets[index], ...req.body };

      await writeTickets(tickets);

      res.send(tickets[index]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});

// Endpoint to delete a ticket by id
app.delete('/rest/ticket/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tickets = await readTickets();
    const index = tickets.findIndex((t) => t.id === id);

    if (index === -1) {
      res.status(404).send('Ticket not found');
    } else {
      const deletedTicket = tickets.splice(index, 1)[0];

      await writeTickets(tickets);

      res.send(deletedTicket);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack)


// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
