

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Fetch contacts from JSON server
 

  useEffect(() => {
    axios.get('http://localhost:3001/api/contacts')
      .then((response) => {
        console.log('Fetched data:', response.data); // Debug log
        setContacts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching contacts:', error);
      });
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact({
      ...newContact,
      [name]: value,
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Check for duplicates in the existing contacts array
  const isDuplicate = (name, email) => {
    return contacts.some((contact) => contact.name === name || contact.email === email);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if name exists in contacts with a different email
    const existingContact = contacts.find((contact) => contact.name === newContact.name);

    if (existingContact) {
      if (existingContact.email !== newContact.email) {
        // Prompt user to confirm replacing the email
        const confirmUpdate = window.confirm(
          `A contact with this name already exists. Do you want to update their email from ${existingContact.email} to ${newContact.email}?`
        );

        if (confirmUpdate) {
          // Update the contact's email if confirmed
          axios.put(`http://localhost:3001/api/contacts/${existingContact.id}`, {
            ...existingContact,
            email: newContact.email,
          })
            .then(() => {
              // Update local contacts state
              setContacts(contacts.map(contact =>
                contact.id === existingContact.id ? { ...contact, email: newContact.email } : contact
              ));
              setNewContact({ name: '', email: '' }); // Reset form fields
            })
            .catch((error) => {
              console.error('Error updating email:', error);
            });
        }
      } else {
        // If name and email are the same, don't submit
        setError('This contact already exists with the same email.');
      }
    } else {
      // If no existing contact, add the new contact
      axios.post('http://localhost:3001/api/contacts', newContact)
        .then((response) => {
          setContacts([...contacts, response.data]);
          setNewContact({ name: '', email: '' }); // Reset form fields
        })
        .catch((error) => {
          console.error('Error adding new contact:', error);
        });
    }
  };

  const handleDelete = (contactId) => {
    // Confirm the deletion with the user
    const confirmDelete = window.confirm('Are you sure you want to delete this contact?');

    if (confirmDelete) {
      // Delete the contact from the server
      axios.delete(`http://localhost:3001/api/contacts/${contactId}`)
        .then(() => {
          // Remove the contact from the local state
          setContacts(contacts.filter(contact => contact.id !== contactId));
        })
        .catch((error) => {
          console.error('Error deleting contact:', error);
        });
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="contacts-app">
      <h1>Contact List</h1>

      

      {/* Form to add a new contact */}
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="name"
          value={newContact.name}
          onChange={handleInputChange}
          placeholder="Contact Name"
          required
        />
        <input
          type="email"
          name="email"
          value={newContact.email}
          onChange={handleInputChange}
          placeholder="Contact Email"
          required
        />
        <button type="submit">Add Contact</button>
      </form>

      {/* Error message if validation fails */}
      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
      />

      {/* Table to display existing contacts */}
      <table className ="contacts=app">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Email</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
        {filteredContacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>
                {/* Delete button for each contact */}
                <button onClick={() => handleDelete(contact.id)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Contacts;
