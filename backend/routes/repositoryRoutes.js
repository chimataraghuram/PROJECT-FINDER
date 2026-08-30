import express from 'express';
import { inspectRepository, searchCode, getIndexedRepository } from '../controllers/repositoryController.js';

const router = express.Router();
router.get('/:owner/:repo/intelligence', inspectRepository);
router.get('/code-search', searchCode);
router.get('/indexed/:repositoryId', getIndexedRepository);
export default router;
