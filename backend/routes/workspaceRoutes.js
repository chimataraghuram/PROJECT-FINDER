import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listCollections, createCollection, addProjectToCollection, listNotes, upsertNote, listSearchHistory, recordSearch } from '../controllers/workspaceController.js';

const router = express.Router();
router.use(protect);
router.get('/collections', listCollections);
router.post('/collections', createCollection);
router.post('/collections/:collectionId/projects', addProjectToCollection);
router.get('/notes', listNotes);
router.put('/notes', upsertNote);
router.get('/search-history', listSearchHistory);
router.post('/search-history', recordSearch);
export default router;
