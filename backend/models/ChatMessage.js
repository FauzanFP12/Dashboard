const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  fileUrl: String, // URL file yang diupload
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
