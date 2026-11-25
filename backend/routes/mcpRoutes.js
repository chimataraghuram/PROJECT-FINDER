import express from 'express';
import { listMcpTools, callMcpTool } from '../controllers/mcpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/tools', protect, listMcpTools);
router.post('/call', protect, callMcpTool);
export default router;
