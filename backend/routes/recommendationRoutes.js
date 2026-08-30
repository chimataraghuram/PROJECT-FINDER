import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { recommendProjects } from '../controllers/recommendationController.js';

const router = express.Router();
router.get('/', protect, recommendProjects);
export default router;
