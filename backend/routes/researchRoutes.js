import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listResearchSessions, getResearchSession, createResearchSession, addResearchMessage, deleteResearchSession, renameResearchSession } from '../controllers/researchController.js';

const router = express.Router();
router.use(protect);
router.get('/', listResearchSessions);
router.get('/:sessionId', getResearchSession);
router.post('/', createResearchSession);
router.post('/:sessionId/messages', addResearchMessage);
router.delete('/:sessionId', deleteResearchSession);
router.patch('/:sessionId', renameResearchSession);
export default router;
