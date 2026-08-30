import { enqueueIngestion, getJob } from '../services/jobQueue.js';
import IngestionJob from '../models/IngestionJob.js';

export const startIngestionJob = (req, res) => res.status(202).json(enqueueIngestion(req.params.owner, req.params.repo));
export const getIngestionJob = async (req, res) => { const job = getJob(req.params.jobId) || await IngestionJob.findOne({ jobId: req.params.jobId }).lean(); if (!job) return res.status(404).json({ message: 'Job not found' }); res.json(job); };
