import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { submitAIFeedback } from '../controllers/feedbackController.js';

const router = express.Router();
router.post('/ai/:interactionId', protect, submitAIFeedback);
export default router;
