import express from 'express';
import HelpdeskTicket from '../models/HelpdeskTicket.js'; // Assuming a Mongoose model is defined for HelpdeskTicket
import User from '../models/User.js'; // Import the User model to populate createdBy

const router = express.Router();

// Get all helpdesk tickets
router.get('/', async (req, res) => {
  try {
    // Fetch tickets and populate the 'createdBy' field with the user's fullName
    const tickets = await HelpdeskTicket.find()
      .populate('createdBy', 'fullName') // Populate createdBy field with the fullName of the user
      .exec();
      
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: err.message });
  }
});

// Create a new helpdesk ticket
router.post('/', async (req, res) => {
  const { subject, description, status, fullName } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ message: 'Subject and description are required' });
  }

  try {
    // Assuming fullName comes from the logged-in user, find the corresponding user by fullName
    const user = await User.findOne({ fullName }); // Find the user based on fullName

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new ticket with the user ID for createdBy
    const newTicket = new HelpdeskTicket({
      subject,
      description,
      status,
      createdAt: new Date(),
      createdBy: user._id, // Save the user ID in createdBy
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket', error: err.message });
  }
});

// Get messages for a specific helpdesk ticket (if required)
router.get('/:ticketId/chat', async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await HelpdeskTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json(ticket.chatMessages); // Assuming ticket has a chatMessages field
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

// Post a message to a specific helpdesk ticket
router.post('/:ticketId/chat', async (req, res) => {
  const ticketId = req.params.ticketId;
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: 'Sender and message are required' });
  }

  try {
    const ticket = await HelpdeskTicket.findById(ticketId); // This uses the _id from MongoDB
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.chatMessages.push({ sender, message, createdAt: new Date() });
    await ticket.save();
    res.status(200).json(ticket.chatMessages); // Return updated chat messages
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// Update ticket status
router.patch('/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const ticket = await HelpdeskTicket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json(ticket); // Send the updated ticket with the new status
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
});

export default router;
