import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listResearchSessions, createResearchSession, addResearchMessage, deleteResearchSession } from '../controllers/researchController.js';

const router = express.Router();
router.use(protect);
router.get('/', listResearchSessions);
router.post('/', createResearchSession);
router.post('/:sessionId/messages', addResearchMessage);
router.delete('/:sessionId', deleteResearchSession);
export default router;
