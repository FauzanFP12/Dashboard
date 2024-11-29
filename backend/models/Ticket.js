const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Open' },
});

module.exports = mongoose.model('Ticket', ticketSchema);
