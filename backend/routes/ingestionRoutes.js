import express from 'express';
import { ingestRepository } from '../controllers/ingestionController.js';

const router = express.Router();
router.post('/:owner/:repo', ingestRepository);
export default router;
