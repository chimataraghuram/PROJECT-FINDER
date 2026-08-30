import express from 'express';
import { analyzeRepository, compareRepositories } from '../controllers/analysisController.js';

const router = express.Router();
router.get('/:repositoryId', analyzeRepository);
router.post('/compare', compareRepositories);
export default router;
