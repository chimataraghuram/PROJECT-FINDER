import express from 'express';
import { listEvaluations, recordEvaluation } from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/', listEvaluations);
router.post('/', recordEvaluation);
export default router;
