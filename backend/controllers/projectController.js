import axios from 'axios';
import FavoriteProject from '../models/FavoriteProject.js';

// Helper for GitHub topic mapping
const getGitHubTopic = (category) => {
  const map = {
    'AI': 'ai+OR+topic:machine-learning+OR+topic:artificial-intelligence',
    'Web': 'web-development+OR+topic:frontend+OR+topic:backend',
    'Mobile': 'mobile+OR+topic:android+OR+topic:ios+OR+topic:react-native',
    'Data': 'data-science+OR+topic:data-analysis+OR+topic:visualization',
    'Game': 'game-dev+OR+topic:unity+OR+topic:unreal-engine',
    'Tools': 'dev-tools+OR+topic:cli+OR+topic:automation',
    'Agent': 'ai-agents+OR+topic:agents+OR+topic:llm-apps'
  };
  return map[category] || category.toLowerCase();
};

// Proxy GitHub Trending
export const getTrendingProjects = async (req, res) => {
  const { category = 'All', timestamp } = req.query;
  try {
    const topic = category !== 'All' ? `+topic:${getGitHubTopic(category)}` : '';
    // Optimized Phase 7 Query
    const q = `stars:>500+created:>2024-01-01${topic}`;
    
    console.log("BACKEND API CALLED (Trending):", `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc`);

    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`,
      { 
        headers: { 
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
        } 
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error("GITHUB PROXY ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to load projects" });
  }
};

// Proxy GitHub Search
export const searchProjects = async (req, res) => {
  const { q, category = 'All', timestamp } = req.query;
  if (!q) return res.status(400).json({ message: "Query is required" });

  try {
    const topic = category !== 'All' ? `+topic:${getGitHubTopic(category)}` : '';
    // Optimized Phase 7 Query
    const query = `${q}+in:name,description+stars:>10${topic}`;

    console.log("BACKEND API CALLED (Search):", `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`);

    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=30`,
      { 
        headers: { 
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
        } 
      }
    );
    res.json(response.data.items);
  } catch (error) {
    console.error("GITHUB PROXY ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to load projects" });
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
      { 
        headers: { 
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
        } 
      }
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
      { 
        headers: { 
          'Accept': 'application/vnd.github.v3.raw',
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
        } 
      }
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
      { 
        headers: { 
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
        } 
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
