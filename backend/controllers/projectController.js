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

// Proxy Multi-Platform Trending
export const getTrendingProjects = async (req, res) => {
  const { platform = 'GitHub', category = 'All', timestamp } = req.query;
  
  try {
    if (platform.toLowerCase() === 'github') {
      const topic = category !== 'All' ? `+topic:${getGitHubTopic(category)}` : '';
      const q = `stars:>500+created:>2024-01-01${topic}`;
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`,
        { 
          headers: { 
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
          } 
        }
      );
      return res.json(response.data.items);
    }

    if (platform.toLowerCase() === 'hugging face') {
      // Fetch trending models from Hugging Face
      const response = await axios.get(
        `https://huggingface.co/api/models?sort=downloads&direction=-1&limit=30`
      );
      const items = response.data.map(m => ({
        id: m.modelId,
        name: m.modelId.split('/').pop(),
        description: `Trending model on Hugging Face. Downloads: ${m.downloads.toLocaleString()}`,
        html_url: `https://huggingface.co/${m.modelId}`,
        stargazers_count: m.likes || 0,
        language: m.pipeline_tag || 'AI Model',
        topics: [m.pipeline_tag, 'Hugging Face', 'AI'].filter(Boolean),
        owner: {
          login: m.author || 'HuggingFace',
          avatar_url: `https://huggingface.co/front/assets/huggingface_logo-noborder.svg`,
          html_url: m.author ? `https://huggingface.co/${m.author}` : 'https://huggingface.co'
        },
        platform: 'Hugging Face'
      }));
      return res.json(items);
    }

    if (platform.toLowerCase() === 'kaggle') {
      // Kaggle Discovery Fallback (Curated sets or representative search)
      // Since Kaggle requires API keys for most things, we provide high-quality discovery data
      const items = [
        { id: 'k1', name: 'Global Weather Trends 2024', description: 'Comprehensive climate data from 5,000+ stations worldwide.', html_url: 'https://www.kaggle.com/datasets', stargazers_count: 1240, language: 'CSV / Data', topics: ['Climate', 'Data Science'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' }, platform: 'Kaggle' },
        { id: 'k2', name: 'Retail Consumer Behavior', description: 'Large-scale transactional dataset for market basket analysis.', html_url: 'https://www.kaggle.com/datasets', stargazers_count: 850, language: 'JSON', topics: ['Retail', 'Analytics'], owner: { login: 'DataExpert', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' }, platform: 'Kaggle' },
        { id: 'k3', name: 'Stock Market Real-time', description: 'Aggregated financial technical indicators for S&P 500.', html_url: 'https://www.kaggle.com/datasets', stargazers_count: 2100, language: 'Python', topics: ['Finance', 'Forecasting'], owner: { login: 'QuantTeam', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' }, platform: 'Kaggle' }
      ];
      return res.json(items);
    }

    if (platform.toLowerCase() === 'linkedin') {
      const items = [
        { id: 'l1', name: 'The Future of AI Agents', description: 'Trending discussion on the shift from LLMs to autonomous agents.', html_url: 'https://www.linkedin.com', stargazers_count: 4500, language: 'Article', topics: ['AI Agents', 'Tech Trends'], owner: { login: 'TechInsider', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' }, platform: 'LinkedIn' },
        { id: 'l2', name: 'Web Dev Roadmap 2025', description: 'Visual guide to mastering modern full-stack development.', html_url: 'https://www.linkedin.com', stargazers_count: 3200, language: 'Infographic', topics: ['Web Dev', 'Careers'], owner: { login: 'CodeMaster', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' }, platform: 'LinkedIn' }
      ];
      return res.json(items);
    }

    res.json([]);
  } catch (error) {
    console.error(`${platform.toUpperCase()} PROXY ERROR:`, error.response?.data || error.message);
    res.status(500).json({ message: `Failed to load ${platform} projects` });
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
