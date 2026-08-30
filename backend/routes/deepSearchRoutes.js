import express from 'express';
import { deepSearch, searchChunks, hybridSearch } from '../controllers/deepSearchController.js';

const router = express.Router();
router.get('/', deepSearch);
router.get('/chunks', searchChunks);
router.get('/hybrid', hybridSearch);
export default router;
