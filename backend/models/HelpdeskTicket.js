import mongoose from 'mongoose';

const helpdeskTicketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Store user ID
  chatMessages: [
    {
      sender: { type: String, required: true },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      fileUrl: String, // URL file yang diupload, associated with this message
      files: [
        {
          filename: { type: String, required: true },  // File name
          path: { type: String, required: true },      // File path
          size: { type: Number, required: true },      // File size
          uploadedAt: { type: Date, default: Date.now }, // Timestamp of when the file was uploaded
          fileUrl: String, // URL file yang diupload
        },
      ],
    },
  ],
});

const HelpdeskTicket = mongoose.model('HelpdeskTicket', helpdeskTicketSchema);

export default HelpdeskTicket;
