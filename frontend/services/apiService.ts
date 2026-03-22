import { Project, SearchResult, GroundingSource } from "../types";

const BACKEND_URL = 'http://localhost:5000/api';

// Mapping helper to ensure UI stability
const mapToFrontendProject = (item: any): Project => ({
  id: item.id?.toString() || Math.random().toString(),
  name: item.name || 'Unknown Project',
  description: item.description || '',
  platform: item.platform || 'GitHub',
  url: item.html_url || '#',
  stars: item.stargazers_count || 0,
  language: item.language || 'Unknown',
  tags: item.topics || [],
  isPublisher: false,
  owner: item.owner ? {
    login: item.owner.login,
    avatar_url: item.owner.avatar_url,
    html_url: item.owner.html_url
  } : null,
  image: item.owner?.avatar_url || null,
  readme: item.description || ''
});

// Service functions continue below...

export const searchProjects = async (query: string, category: string = 'All'): Promise<SearchResult> => {
  const timestamp = Date.now();
  try {
    const url = `${BACKEND_URL}/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&timestamp=${timestamp}`;
    console.log("BACKEND API TRYING:", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend search failed`);
    
    const data = await response.json();
    console.log("BACKEND RESULT COUNT:", data.length || 0);
    const projects = (data || []).map(mapToFrontendProject);
    
    return {
      summary: `Found ${projects.length} results via GitHub real-time search${category !== 'All' ? ` in ${category}` : ''}.`,
      projects,
      groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  } catch (error) {
    console.warn('[Backend API] Search failed, falling back to direct GitHub API.', error);
    // FALLBACK TO DIRECT GITHUB API
    try {
      const q = `${query} in:name,description stars:>10${category !== 'All' ? ` topic:${category.toLowerCase()}` : ''}`;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&timestamp=${timestamp}`;
      console.log("FALLBACK API CALLED:", url);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error("GitHub fallback failed");
      const data = await res.json();
      const projects = (data.items || []).map(mapToFrontendProject);
      return {
        summary: `Found ${projects.length} results via GitHub direct fallback.`,
        projects,
        groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
      };
    } catch (fallbackError) {
      console.error('All search attempts failed:', fallbackError);
      return { summary: 'Unable to connect to GitHub API.', projects: [], groundingSources: [] };
    }
  }
};

export const fetchTrendingProjects = async (platform: string = 'GitHub', category: string = 'All'): Promise<Project[]> => {
  const timestamp = Date.now();
  try {
    const url = `${BACKEND_URL}/trending?platform=${encodeURIComponent(platform)}&category=${encodeURIComponent(category)}&timestamp=${timestamp}`;
    console.log("BACKEND API TRYING:", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend trending failed`);

    const data = await response.json();
    console.log("BACKEND RESULT COUNT:", data.length || 0);
    return (data || []).map(mapToFrontendProject);
  } catch (error) {
    console.warn(`[Backend API] ${platform} trending failed, falling back.`, error);
    
    // Only GitHub has a direct frontend fallback
    if (platform.toLowerCase() === 'github') {
      try {
        const q = `stars:>500 created:>2024-01-01${category !== 'All' ? ` topic:${category.toLowerCase()}` : ''}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&timestamp=${timestamp}`;
        console.log("FALLBACK API CALLED:", url);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error("GitHub fallback failed");
        const data = await res.json();
        return (data.items || []).slice(0, 30).map(mapToFrontendProject);
      } catch (fallbackError) {
        console.error('GitHub fallback failed:', fallbackError);
        return [];
      }
    }

    if (platform.toLowerCase() === 'hugging face') {
      return [
        { id: 'hf1', name: 'Stable-Diffusion-3-Medium', description: 'Advanced latent diffusion model for high-resolution image synthesis.', platform: 'Hugging Face', url: 'https://huggingface.co', stars: 12500, language: 'Python', tags: ['Diffusers', 'Generative AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf2', name: 'Llama-3-70B-Instruct', description: 'Meta\'s latest high-performance instruction-tuned large language model.', platform: 'Hugging Face', url: 'https://huggingface.co', stars: 8400, language: 'Python', tags: ['LLM', 'Transformers'], owner: { login: 'MetaAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf3', name: 'Mistral-7B-v0.3', description: 'Upgraded version of the popular Mistral-7B model with improved attention.', platform: 'Hugging Face', url: 'https://huggingface.co', stars: 6200, language: 'Python', tags: ['NLP', 'Mistral'], owner: { login: 'MistralAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } }
      ].map(mapToFrontendProject);
    }

    if (platform.toLowerCase() === 'kaggle') {
      return [
        { id: 'k1', name: 'Global Weather Trends 2024', description: 'Comprehensive climate data from 5,000+ stations worldwide.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets', stars: 1240, language: 'CSV / Data', tags: ['Climate', 'Data Science'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k2', name: 'Retail Consumer Behavior', description: 'Large-scale transactional dataset for market basket analysis.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets', stars: 850, language: 'JSON', tags: ['Retail', 'Analytics'], owner: { login: 'DataExpert', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } }
      ].map(mapToFrontendProject);
    }

    if (platform.toLowerCase() === 'linkedin') {
      return [
        { id: 'l1', name: 'The Future of AI Agents', description: 'Trending discussion on the shift from LLMs to autonomous agents.', platform: 'LinkedIn', url: 'https://www.linkedin.com', stars: 4500, language: 'Article', tags: ['AI Agents', 'Tech Trends'], owner: { login: 'TechInsider', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } }
      ].map(mapToFrontendProject);
    }
    
    return [];
  }
};

export const searchGitHubReadmes = async (category: string = 'All'): Promise<Project[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/search/readmes?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('README search failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('README search error:', error);
    return [];
  }
};

export const searchGitHubUsers = async (query: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/search/users?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('User search failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
};

export const fetchProjectReadme = async (url: string): Promise<string> => {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return '';
    const [_, owner, repo] = match;
    const response = await fetch(`${BACKEND_URL}/readme/${owner}/${repo}`);
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    console.error('Fetch README error:', error);
    return '';
  }
};

export const fetchGitHubUserProfile = async (username: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_URL}/user/${username}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};

export const saveProject = async (project: Project, token: string): Promise<Project | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectName: project.name,
        repoUrl: project.url,
        stars: project.stars,
        language: project.language,
        description: project.description,
        platform: project.platform,
        tags: project.tags
      })
    });
    if (!response.ok) throw new Error('Save failed');
    const data = await response.json();
    return mapToFrontendProject(data);
  } catch (error) {
    console.error('Save error:', error);
    return null;
  }
};

export const fetchFavorites = async (token: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/user/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Favorites fetch failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return [];
  }
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return await response.json();
};

export const signupUser = async (username: string, email: string, password: string): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return await response.json();
};

export const summarizeProject = (name: string, description: string, readme: string): any => {
  let overview = description;
  if (readme) {
    const lines = readme.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('!'));
    if (lines.length > 0) {
      overview = lines[0].replace(/\[.*?\]\(.*?\)/g, '').replace(/[*_~`]/g, '').trim();
      if (overview.length < 50 && lines.length > 1) {
        overview += ' ' + lines[1].trim();
      }
    }
  }

  const techKeywords = ['React', 'Vue', 'Node', 'Python', 'TypeScript', 'Docker', 'ML', 'AI'];
  const foundTech = techKeywords.filter(tech => readme.toLowerCase().includes(tech.toLowerCase()));

  return {
    overview: overview.length > 150 ? overview.substring(0, 147) + '...' : overview,
    useCase: "General development or research.",
    techStack: foundTech.slice(0, 5)
  };
};
