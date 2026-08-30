import express from 'express';
import { startIngestionJob, getIngestionJob } from '../controllers/jobController.js';

const router = express.Router();
router.post('/ingest/:owner/:repo', startIngestionJob);
router.get('/:jobId', getIngestionJob);
export default router;
