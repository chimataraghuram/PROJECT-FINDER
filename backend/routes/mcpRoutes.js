import express from 'express';
import { listMcpTools, callMcpTool } from '../controllers/mcpController.js';

const router = express.Router();
router.get('/tools', listMcpTools);
router.post('/call', callMcpTool);
export default router;
