import axios from 'axios';
import FavoriteProject from '../models/FavoriteProject.js';

// Proxy GitHub Trending
export const getTrendingProjects = async (req, res) => {
  const { category = 'All' } = req.query;
  try {
    let query = 'stars:>5000';
    if (category !== 'All') {
      const categoryMap = {
        'AI': 'topic:machine-learning',
        'Web': 'topic:frontend',
        'ML': 'topic:machine-learning',
      };
      query += ` ${categoryMap[category] || category}`;
    }

    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    // Map to the format the frontend expects internally (or we will map it in apiService.ts)
    // To minimize UI disturbance, we'll return a clean JSON and let the frontend map it.
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Proxy GitHub Search
export const searchProjects = async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=15`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save Project
export const saveProject = async (req, res) => {
  const { projectName, repoUrl, stars, language, description, platform, tags } = req.body;
  try {
    const favorite = new FavoriteProject({
      userId: req.user._id,
      projectName,
      repoUrl,
      stars,
      language,
      description,
      platform,
      tags
    });
    const saved = await favorite.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Favorites
export const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteProject.find({ userId: req.user._id });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Proxy GitHub README Search
export const searchReadmes = async (req, res) => {
  const { category = 'All' } = req.query;
  try {
    let query = '(topic:github-profile-readme OR topic:awesome-github-profile-readme OR topic:github-profile)';
    if (category !== 'All') {
      const categoryMap = {
        'Github Actions': 'actions OR automation OR workflow',
        'Game Mode': 'game OR interactive OR pygame OR unity OR interactive-readme',
        'Code Mode': 'developer OR code OR software OR engineer OR polyglot',
        'Dynamic Realtime': 'dynamic OR stats OR realtime OR live OR animated OR stats-card',
        'Minimalistic': 'minimal OR simple OR clean OR sleek OR basic',
        'GIFS': 'gif OR animated OR motion OR svg OR animation',
        'Anime': 'anime OR manga OR otaku OR kawai OR waifu',
        'Retro': 'retro OR 8bit OR arcade OR pixel OR nostalgic',
        'Just Images': 'images OR photo OR gallery OR visual'
      };
      query += `+${categoryMap[category] || category}`;
    }

    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Proxy GitHub User Search
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=12`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Proxy GitHub README Content
export const getProjectReadme = async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: { 'Accept': 'application/vnd.github.v3.raw' } }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Proxy GitHub User Profile
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
