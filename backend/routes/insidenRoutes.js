import express from 'express';
import { 
  getInsidens, 
  createInsiden, 
  updateInsiden,
  closeInsiden,
  reopenInsiden,
  deleteInsiden 
} from '../controllers/insidenController.js';

const router = express.Router();

// Routes for incidents
router.get('/', getInsidens); // GET all incidents
router.post('/', createInsiden); // POST a new incident
router.put('/:id', updateInsiden); // UPDATE an incident
router.put('/close/:id', closeInsiden);// Close an incident
router.put('/reopen/:id', reopenInsiden);// Reopen an incident
router.delete('/:id', deleteInsiden); // DELETE an incident

export default router;
