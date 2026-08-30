import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { quickResearch } from '../controllers/quickResearchController.js';

const router = express.Router();
router.post('/answer', protect, quickResearch);
export default router;
