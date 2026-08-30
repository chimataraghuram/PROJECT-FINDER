import express from 'express';
import { parseQuery } from '../controllers/queryController.js';

const router = express.Router();
router.get('/understand', parseQuery);
export default router;
