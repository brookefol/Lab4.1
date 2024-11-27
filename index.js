

const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors()); // Allow all origins
app.use(express.json());
app.use(express.static(path.join(__dirname, 'contacts-frontend/build')));

// list of contacts
let contacts = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];





app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'contacts-frontend', 'build', 'index.html'));
});

// API endpoint for displaying contacts
app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

// functionality for displaying info on web server
app.get('/api/info', (req, res) => {
  const appName = 'Contacts Web Server';
  const contactCount = contacts.length;
  const responseHTML = `
    <html>
      <body>
        <h1>${appName}</h1>
        <p>Number of contacts: ${contactCount}</p>
      </body>
    </html>
  `;
  res.send(responseHTML);
});
 // individual contact displaying
app.get('/api/contacts/:id', (req, res) => {
  const contactId = parseInt(req.params.id, 10); 
  const contact = contacts.find(c => c.id === contactId);

  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ error: 'Contact not found' }); 
  }
});

// function to delete contacts
app.delete('/api/contacts/:id', (req, res) => {
  const contactId = parseInt(req.params.id, 10); 
  const contact = contacts.find(c => c.id === contactId); 

  if (!contact) {
    // if contact not found, then it responds with 404
    return res.status(404).json({ error: 'Contact not found' });
  }

  
  contacts = contacts.filter(c => c.id !== contactId);

  // sends response with "204 No Content" if contact successfully found & deleted
  res.status(204).send();
});

// functionality to create contacts
app.post('/api/contacts', (req, res) => {
  const { name, email } = req.body; // extracts name and email from the request body

  // ensure email & name fields are both filled in
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // checks for duplicate email
  const emailExists = contacts.some(contact => contact.email === email);
  if (emailExists) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  // generates a unique ID
  const id = `${Math.floor(Math.random() * 1000000)}-${Date.now()}`;

  // contact creation
  const newContact = { id, name, email };
  contacts.push(newContact);

  // successful status message if contact created
  res.status(201).json(newContact);
});


// starting the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/api/contacts`);
});
