import express from 'express';
import { getTrendingProjects, searchProjects, saveProject, getFavorites, searchReadmes, searchUsers, getProjectReadme, getUserProfile, getUserStarred } from '../controllers/projectController.js';
import { getAIResponse } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingProjects);
router.get('/search', searchProjects);
router.get('/search/readmes', searchReadmes);
router.get('/search/users', searchUsers);
router.get('/readme/:owner/:repo', getProjectReadme);
router.get('/user/:username', getUserProfile);
router.get('/user/:username/starred', getUserStarred);
router.post('/save', protect, saveProject);
router.get('/user/favorites', protect, getFavorites);
router.post('/ai', getAIResponse);

export default router;
