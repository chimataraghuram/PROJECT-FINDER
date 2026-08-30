import express from 'express';
import { answerResearchQuestion, streamResearchAnswer } from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/answer', answerResearchQuestion);
router.post('/stream', streamResearchAnswer);
export default router;
