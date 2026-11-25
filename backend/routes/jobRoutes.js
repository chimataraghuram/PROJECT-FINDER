import express from 'express';
import { startIngestionJob, getIngestionJob } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/ingest/:owner/:repo', protect, startIngestionJob);
router.get('/:jobId', protect, getIngestionJob);
export default router;
