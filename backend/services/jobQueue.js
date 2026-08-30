import crypto from 'crypto';
import { ingestRepository } from '../controllers/ingestionController.js';
import { clearSearchCache } from '../controllers/projectController.js';
import IngestionJob from '../models/IngestionJob.js';

const jobs = new Map();
const activeJobs = new Map();

export const enqueueIngestion = (owner, repo) => {
  const key = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const activeId = activeJobs.get(key);
  if (activeId && jobs.get(activeId) && ['queued', 'processing'].includes(jobs.get(activeId).status)) return jobs.get(activeId);
  const id = crypto.randomUUID();
  jobs.set(id, { id, type: 'repository-ingestion', owner, repo, status: 'queued', createdAt: new Date().toISOString() });
  IngestionJob.create({ jobId: id, owner, repo, status: 'queued' }).catch(() => {});
  activeJobs.set(key, id);
  setImmediate(async () => {
    const job = jobs.get(id); if (!job) return;
    job.status = 'processing';
    IngestionJob.updateOne({ jobId: id }, { status: 'processing' }).catch(() => {});
    const req = { params: { owner, repo } };
    const res = { status: code => ({ json: payload => { job.status = 'failed'; job.error = payload.message; job.httpStatus = code; } }), json: payload => { job.status = 'completed'; job.result = payload; } };
    try { await ingestRepository(req, res); } catch (error) { job.status = 'failed'; job.error = error.message; }
    job.completedAt = new Date().toISOString();
    IngestionJob.updateOne({ jobId: id }, { status: job.status, result: job.result, error: job.error, completedAt: job.completedAt }).catch(() => {});
    activeJobs.delete(key);
    if (job.status === 'completed') clearSearchCache();
  });
  return jobs.get(id);
};

export const getJob = id => jobs.get(id) || null;
