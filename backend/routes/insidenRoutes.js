import express from 'express';
import { 
  getInsidens, 
  createInsiden, 
  updateInsiden,
  closeInsiden,
  reopenInsiden,
  deleteInsiden,
  moveToQueue, 
  getChatMessages,  // Import getChatMessages function here
  saveChatMessage
} from '../controllers/insidenController.js';

const router = express.Router();

// Routes for incidents
router.get('/', getInsidens); // GET all incidents
router.post('/', createInsiden); // POST a new incident
router.put('/:id', updateInsiden); // UPDATE an incident
router.put('/close/:id', closeInsiden); // Close an incident
router.put('/reopen/:id', reopenInsiden); // Reopen an incident
router.put('/work/:id', moveToQueue);  // Move incident to In Queue status
router.delete('/:id', deleteInsiden); // DELETE an incident
// Route to get chat messages for a specific incident
router.get('/:incidentId/chat', getChatMessages);

// Route to post a new chat message
router.post('/:incidentId/chat', saveChatMessage);

export default router;
