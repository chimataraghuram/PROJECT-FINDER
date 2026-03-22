import { Project, SearchResult, GroundingSource } from "../types";

const BACKEND_URL = 'http://localhost:5000/api';

// Mapping helper to ensure UI stability
const mapToFrontendProject = (item: any): Project => ({
  id: item.id?.toString() || Math.random().toString(),
  name: item.name || 'Unknown Project',
  description: item.description || '',
  platform: 'GitHub',
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

export const searchProjects = async (query: string): Promise<SearchResult> => {
  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    const projects = (data.items || []).map(mapToFrontendProject);
    return {
      summary: `Found ${projects.length} results via GitHub real-time search.`,
      projects,
      groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  } catch (error) {
    console.error('Search error:', error);
    return { summary: '', projects: [], groundingSources: [] };
  }
};

export const fetchTrendingProjects = async (platform: string = 'All', category: string = 'All'): Promise<Project[]> => {
  try {
    // Using GitHub Search API for trending: stars > 5000 and sorted by stars
    const query = category !== 'All' ? `${category} stars:>5000` : 'stars:>5000';
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`);
    if (!response.ok) throw new Error('Trending fetch failed');
    const data = await response.json();
    return (data.items || []).map(mapToFrontendProject);
  } catch (error) {
    console.error('Trending fetch error:', error);
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
