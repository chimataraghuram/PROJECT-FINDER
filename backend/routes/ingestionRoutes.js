import express from 'express';
import { ingestRepository } from '../controllers/ingestionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/:owner/:repo', protect, ingestRepository);
export default router;
