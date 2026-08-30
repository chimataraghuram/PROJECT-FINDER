import express from 'express';
import { getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/me', protect, getCurrentUser);
export default router;
