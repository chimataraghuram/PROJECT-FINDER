import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listCollections, createCollection, addProjectToCollection, updateCollection, deleteCollection, removeProjectFromCollection, listNotes, upsertNote, listSearchHistory, recordSearch } from '../controllers/workspaceController.js';

const router = express.Router();
router.use(protect);
router.get('/collections', listCollections);
router.post('/collections', createCollection);
router.post('/collections/:collectionId/projects', addProjectToCollection);
router.patch('/collections/:collectionId', updateCollection);
router.delete('/collections/:collectionId', deleteCollection);
router.delete('/collections/:collectionId/projects/:projectId', removeProjectFromCollection);
router.get('/notes', listNotes);
router.put('/notes', upsertNote);
router.get('/search-history', listSearchHistory);
router.post('/search-history', recordSearch);
export default router;
