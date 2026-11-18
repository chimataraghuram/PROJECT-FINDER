import { Project, SearchResult, GroundingSource } from "../types";
import { normalizeUrl } from "../src/utils/urlHelper";
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api' 
  : 'https://project-finder-api.onrender.com/api';

const cacheKey = (kind: string, value: string) => `project-finder-cache:${kind}:${value}`;
const readCache = <T,>(key: string): T | null => {
  try { const item = JSON.parse(localStorage.getItem(key) || 'null'); return item?.value || null; } catch { return null; }
};
const writeCache = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify({ value, cachedAt: new Date().toISOString() })); } catch { /* storage may be unavailable */ }
};
const githubApiError = (status: number) => status === 401
  ? new Error('GitHub authentication expired. Reconnect your GitHub account.')
  : status === 403 || status === 429
    ? new Error('GitHub API rate limit reached. Cached results will be used; please try again later.')
    : new Error(`GitHub API unavailable (${status}).`);

// Mapping helper to ensure UI stability and rock-solid repository URLs
const mapToFrontendProject = (item: any): Project => {
  const name = item.name || 'Unknown Project';
  const platform = item.platform || 'GitHub';
  const ownerLogin = item.owner?.login || (typeof item.owner === 'string' ? item.owner : '');

  // 1. Resolve raw URL candidate from possible fields
  let rawUrl = item.html_url || item.url || item.web_url || item.repoUrl || item.projectUrl || '';

  // 2. Check if rawUrl is an internal GitHub API endpoint (e.g. https://api.github.com/repos/owner/name)
  if (typeof rawUrl === 'string' && rawUrl.includes('api.github.com/repos/')) {
    rawUrl = rawUrl.replace('https://api.github.com/repos/', 'https://github.com/').replace('http://api.github.com/repos/', 'https://github.com/');
  }

  // 3. Fallback to owner/repo or full_name if URL is missing or placeholder '#'
  if (!rawUrl || rawUrl === '#' || rawUrl.trim() === '') {
    if (item.full_name) {
      rawUrl = platform === 'GitHub' ? `https://github.com/${item.full_name}` : `https://huggingface.co/${item.full_name}`;
    } else if (ownerLogin && name && name !== 'Unknown Project') {
      rawUrl = platform === 'GitHub' ? `https://github.com/${ownerLogin}/${name}` :
               platform === 'Kaggle' ? `https://www.kaggle.com/datasets/${ownerLogin}/${name}` :
               platform === 'Hugging Face' ? `https://huggingface.co/${ownerLogin}/${name}` : '';
    }
  }

  // 4. Normalize URL safely
  let repoUrl = normalizeUrl(rawUrl, platform);
  if (repoUrl === '#' && platform === 'GitHub' && name && name !== 'Unknown Project') {
    repoUrl = `https://github.com/search?q=${encodeURIComponent(name)}`;
  } else if ((repoUrl === '#' || repoUrl === 'https://www.kaggle.com/datasets' || repoUrl === 'https://www.kaggle.com') && platform === 'Kaggle' && name && name !== 'Unknown Project') {
    repoUrl = `https://www.kaggle.com/datasets?search=${encodeURIComponent(name)}`;
  } else if ((repoUrl === '#' || repoUrl === 'https://www.linkedin.com' || repoUrl === 'https://www.linkedin.com/') && platform === 'LinkedIn' && name && name !== 'Unknown Project') {
    repoUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(name)}`;
  }

  const stars = item.stargazers_count !== undefined ? item.stargazers_count : (item.stars || 0);
  const topics = item.topics || item.tags || [];
  
  // 5. Improved Live URL extraction and normalization
  let rawLive = (item.homepage && item.homepage !== repoUrl && item.homepage !== '#') ? item.homepage : 
                (item.liveUrl && item.liveUrl !== repoUrl && item.liveUrl !== '#') ? item.liveUrl : 
                (item.demoUrl && item.demoUrl !== repoUrl && item.demoUrl !== '#') ? item.demoUrl : null;
  const liveUrl = rawLive ? (normalizeUrl(rawLive) !== '#' ? normalizeUrl(rawLive) : null) : null;

  // 6. Safe Owner profile link
  const rawOwnerUrl = item.owner?.html_url || item.owner?.url || '';
  let ownerUrl = normalizeUrl(rawOwnerUrl, platform);
  if (ownerUrl === '#' && ownerLogin) {
    ownerUrl = platform === 'GitHub' ? `https://github.com/${ownerLogin}` :
               platform === 'Kaggle' ? `https://www.kaggle.com/${ownerLogin}` :
               platform === 'Hugging Face' ? `https://huggingface.co/${ownerLogin}` :
               platform === 'LinkedIn' ? `https://www.linkedin.com/in/${ownerLogin}` : platform === 'npm' ? `https://www.npmjs.com/~${ownerLogin}` : '#';
  }

  return {
    id: item.id?.toString() || Math.random().toString(),
    name,
    description: item.description || '',
    platform,
    url: repoUrl,
    liveUrl: liveUrl,
    stars: stars,
    language: item.language || 'Unknown',
    tags: topics,
    isPublisher: false,
    owner: {
      login: ownerLogin || 'Community',
      avatar_url: item.owner?.avatar_url || '',
      html_url: ownerUrl
    },
    slug: item.slug || null,
    image: item.owner?.avatar_url || null,
    readme: item.description || ''
  };
};

// Service functions continue below...

export const fetchSearch = async (query: string, category: string = 'All', platform: string = 'GitHub'): Promise<SearchResult> => {
  const cleanQuery = query.trim();

  // 1. Direct Real-Time GitHub API Integration:
  // If user searches for GitHub or All, query the live GitHub Search & Repository API in real-time
  if (platform.toLowerCase() === 'github' || platform.toLowerCase() === 'all') {
    try {
      // Check if user entered an exact owner/repo format like "vercel/next.js" or "obra/superpowers"
      const exactRepoMatch = cleanQuery.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
      if (exactRepoMatch) {
        const [, owner, repo] = exactRepoMatch;
        const exactResp = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { cache: 'no-store' });
        if (exactResp.ok) {
          const directRepo = await exactResp.json();
          const mapped = [mapToFrontendProject(directRepo)];
          return {
            summary: `Direct live match found for repository "${directRepo.full_name}" on GitHub.`,
            projects: mapped,
            groundingSources: [{ title: directRepo.full_name, uri: directRepo.html_url }]
          };
        }
      }

      // Real-time live keyword search on GitHub
      const topicFilter = category !== 'All' ? ` topic:${category.toLowerCase()}` : '';
      const searchQuery = `${cleanQuery}${topicFilter}`;
      const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=20`;
      
      console.log("[GitHub Direct API] Querying live:", ghUrl);
      const ghResp = await fetch(ghUrl, { cache: 'no-store' });
      
      if (ghResp.ok) {
        const ghData = await ghResp.json();
        if (Array.isArray(ghData.items) && ghData.items.length > 0) {
          const projects = ghData.items.map(mapToFrontendProject);
          const searchResult: SearchResult = {
            summary: `Found ${ghData.total_count.toLocaleString()} live repositories for "${cleanQuery}" on GitHub.`,
            projects,
            groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
          };
          writeCache(cacheKey('search', `${cleanQuery}:${category}:${platform}`), searchResult);
          return searchResult;
        }
      }
    } catch (ghErr) {
      console.warn("[GitHub Direct API] Direct search error, trying backend proxy:", ghErr);
    }
  }


  // 1.5. Direct Real-Time NPM Registry Integration:
  if (platform.toLowerCase() === 'npm') {
    try {
      const npmQuery = category !== 'All' ? `${cleanQuery} ${category}` : cleanQuery;
      const npmUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(npmQuery)}&size=25`;
      const npmResp = await fetch(npmUrl, { cache: 'no-store' });
      if (npmResp.ok) {
        const npmData = await npmResp.json();
        const objects = npmData.objects || [];
        if (objects.length > 0) {
          const projects = objects.map((item: any) => {
            const pkg = item.package || {};
            const downloads = item.downloads?.weekly || (item.score?.detail?.popularity ? Math.round(item.score.detail.popularity * 1000000) : 0);
            return mapToFrontendProject({
              id: `npm-${pkg.name}`,
              name: pkg.name,
              description: pkg.description || `Official ${pkg.name} package on npm with ${downloads.toLocaleString()} weekly downloads.`,
              html_url: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
              homepage: pkg.links?.homepage || pkg.links?.repository || pkg.links?.npm,
              stargazers_count: downloads,
              language: 'TypeScript',
              topics: Array.isArray(pkg.keywords) ? pkg.keywords.slice(0, 6) : [cleanQuery, 'npm'],
              owner: {
                login: pkg.publisher?.username || pkg.maintainers?.[0]?.username || 'npm-author',
                avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png',
                html_url: pkg.publisher?.username ? `https://www.npmjs.com/~${pkg.publisher.username}` : `https://www.npmjs.com/package/${pkg.name}`
              },
              platform: 'npm',
              version: pkg.version
            });
          });

          const searchResult: SearchResult = {
            summary: `Found ${npmData.total || projects.length} live packages for "${cleanQuery}" on npm registry.`,
            projects,
            groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
          };
          writeCache(cacheKey('search', `${cleanQuery}:${category}:${platform}`), searchResult);
          return searchResult;
        }
      }
    } catch (npmErr) {
      console.warn('[NPM Direct API] Search error, falling back to backend:', npmErr);
    }
  }

  // 1b. Direct Kaggle API Search (CORS-enabled public endpoint for verified live datasets)
  if (platform.toLowerCase() === 'kaggle') {
    try {
      const kaggleUrl = `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(cleanQuery)}&sortBy=votes&pageSize=20`;
      const response = await fetch(kaggleUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const projects = data.map((d: any) => ({
            id: `kaggle-${d.id || d.ref}`,
            name: d.title || (d.ref ? d.ref.split('/')[1] : `${cleanQuery} Dataset`),
            description: d.subtitle || d.description || `Real-world Kaggle dataset for "${cleanQuery}" with ${(d.voteCount || 0).toLocaleString()} upvotes and ${(d.downloadCount || 0).toLocaleString()} downloads.`,
            html_url: d.url || (d.ref ? `https://www.kaggle.com/datasets/${d.ref}` : `https://www.kaggle.com/datasets?search=${encodeURIComponent(cleanQuery)}`),
            stargazers_count: d.voteCount || 0,
            language: 'Dataset',
            topics: [cleanQuery, 'Dataset', 'Kaggle', ...(Array.isArray(d.tags) ? d.tags.map((t: any) => t.name) : [])].filter(Boolean).slice(0, 5),
            owner: {
              login: d.ownerRef || d.creatorUrl || d.ownerName || 'kaggle',
              avatar_url: d.thumbnailImageUrl || 'https://www.kaggle.com/static/images/site-logo.svg',
              html_url: (d.ownerRef || d.creatorUrl) ? `https://www.kaggle.com/${d.ownerRef || d.creatorUrl}` : 'https://www.kaggle.com'
            },
            platform: 'Kaggle'
          })).map(mapToFrontendProject);

          const searchResult: SearchResult = {
            summary: `Found ${projects.length} verified live datasets for "${cleanQuery}" on Kaggle.`,
            projects,
            groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
          };
          writeCache(cacheKey('search', `${cleanQuery}:${category}:${platform}`), searchResult);
          return searchResult;
        }
      }
    } catch (kaggleErr) {
      console.warn('[Kaggle Direct API] Search error, falling back to backend:', kaggleErr);
    }
  }

  // 2. Try Backend Search API Proxy
  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}&category=${encodeURIComponent(category)}&platform=${encodeURIComponent(platform)}`;
    console.log("BACKEND API TRYING (Search):", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const filteredData = Array.isArray(data) ? data.filter(item => {
        const isGenericLink = (item.html_url === 'https://www.kaggle.com/datasets' || item.html_url === 'https://www.kaggle.com' || item.html_url === 'https://www.linkedin.com');
        const hasDeepLink = !!(item.html_url && item.html_url.length > 30 && !item.html_url.endsWith('/datasets'));
        return !isGenericLink || hasDeepLink;
      }) : [];

      if (filteredData.length > 0) {
        const platformOrder: Record<string, number> = { 'GitHub': 0, 'Hugging Face': 1, 'Kaggle': 2, 'LinkedIn': 3, 'npm': 4 };
        const projects = filteredData
          .map(mapToFrontendProject)
          .sort((a, b) => (platformOrder[a.platform] ?? 99) - (platformOrder[b.platform] ?? 99));
        
        const searchResult = {
          summary: `Found ${projects.length} results for "${cleanQuery}" on ${platform}${category !== 'All' ? ` in ${category}` : ''}.`,
          projects,
          groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
        };
        writeCache(cacheKey('search', `${cleanQuery}:${category}:${platform}`), searchResult);
        return searchResult;
      }
    }
  } catch (error) {
    console.warn(`[Backend API] Search for ${platform} failed, checking cache or fallbacks.`, error);
  }

  const cached = readCache<SearchResult>(cacheKey('search', `${cleanQuery}:${category}:${platform}`));
  if (cached?.projects?.length) return cached;
  
  // 3. Fallback Curated Discovery
  let fallbackProjects: any[] = [];
  if (platform.toLowerCase() === 'hugging face') {
    fallbackProjects = [
      { id: 'hf-s1', name: `Stable-Diffusion-WebUI`, description: `Browser interface based on Gradio library for Stable Diffusion.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion', stargazers_count: 54000, language: 'Python', topics: [cleanQuery, 'AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co/StabilityAI' } },
      { id: 'hf-s2', name: `${cleanQuery} Model`, description: `Specialized AI model related to "${cleanQuery}" found on Hugging Face.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/meta-llama/Meta-Llama-3-8B', stargazers_count: 12000, language: 'PyTorch', topics: [cleanQuery, 'LLM'], owner: { login: 'HF-Community', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co' } }
    ];
  } else if (platform.toLowerCase() === 'kaggle') {
    const deepSearch = `https://www.kaggle.com/datasets?search=${encodeURIComponent(cleanQuery)}`;
    fallbackProjects = [
      { id: 'kg-s1', name: `${cleanQuery} Datasets & Notebooks`, description: `Curated real-world datasets and analytical notebooks for "${cleanQuery}" on Kaggle.`, platform: 'Kaggle', html_url: deepSearch, stargazers_count: 8500, language: 'Dataset', topics: [cleanQuery, 'Data Science', 'Kaggle'], owner: { login: 'KaggleData', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com' } }
    ];
  } else if (platform.toLowerCase() === 'linkedin') {
    const deepSearch = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(cleanQuery)}`;
    fallbackProjects = [
      { id: 'li-s1', name: `Engineering Insights: ${cleanQuery}`, description: `Trending technical discussions, architecture analyses, and engineering case studies regarding ${cleanQuery} on LinkedIn.`, platform: 'LinkedIn', html_url: deepSearch, stargazers_count: 14500, language: 'Technical Article', topics: [cleanQuery, 'Engineering', 'Tech Trends'], owner: { login: 'LinkedInTech', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca', html_url: deepSearch } },
      { id: 'li-s2', name: `Production Best Practices: ${cleanQuery}`, description: `Real-world operational patterns, system reliability, and enterprise implementation guides for ${cleanQuery}.`, platform: 'LinkedIn', html_url: deepSearch, stargazers_count: 9800, language: 'Case Study', topics: [cleanQuery, 'Production', 'Architecture'], owner: { login: 'CloudArchitects', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca', html_url: deepSearch } }
    ];
  } else {
    fallbackProjects = [
      { id: 'gs-1', name: cleanQuery, description: `Open-source repositories matching "${cleanQuery}" across the developer ecosystem.`, platform: 'GitHub', html_url: `https://github.com/search?q=${encodeURIComponent(cleanQuery)}`, homepage: 'https://github.com', stargazers_count: 15400, language: 'TypeScript', topics: [cleanQuery, 'Open-Source'], owner: { login: 'GitHub-Community', avatar_url: 'https://github.com/github.png' } },
      { id: 'gs-2', name: 'Auto-GPT', description: `An experimental open-source attempt to make GPT-4 fully autonomous.`, platform: 'GitHub', html_url: `https://github.com/Significant-Gravitas/Auto-GPT`, homepage: 'https://agpt.co/', stargazers_count: 154000, language: 'Python', topics: ['AI', 'Autonomous', 'GPT-4'], owner: { login: 'Significant-Gravitas', avatar_url: 'https://github.com/Significant-Gravitas.png' } }
    ];
  }

  const mapped = fallbackProjects.map(mapToFrontendProject);
  return {
    summary: `Providing real-time discovery for ${platform} matching "${cleanQuery}".`,
    projects: mapped,
    groundingSources: mapped.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
  };
};

export const understandSearchQuery = async (query: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/query/understand?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Query understanding failed');
  return response.json();
};

export const fetchDeepSearch = async (query: string, limit = 20, filters: Record<string, string | boolean> = {}): Promise<any> => {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  Object.entries(filters).forEach(([key, value]) => params.set(key, String(value)));
  const response = await fetch(`${BASE_URL}/deep-search?${params.toString()}`);
  if (!response.ok) throw new Error('Deep search failed');
  return response.json();
};

export const fetchHybridSearch = async (query: string, limit = 20): Promise<any> => {
  const response = await fetch(`${BASE_URL}/deep-search/hybrid?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) throw new Error('Hybrid search failed');
  return response.json();
};

export const askResearchQuestion = async (question: string, repositoryId?: string, repository?: { owner?: string; repo?: string }): Promise<any> => {
  const token = localStorage.getItem('project-finder-token');
  const response = await fetch(`${BASE_URL}/rag/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ question, repositoryId, ...repository }) });
  if (!response.ok) throw new Error('Research question failed');
  return response.json();
};

export const askQuickResearchQuestion = async (question: string, repositoryId?: string, repository?: { owner?: string; repo?: string }): Promise<any> => {
  const token = localStorage.getItem('project-finder-token');
  const response = await fetch(`${BASE_URL}/quick-research/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ question, repositoryId, ...repository }) });
  if (!response.ok) throw new Error('Quick research unavailable');
  return response.json();
};

export const streamResearchQuestion = async function* (question: string, repository?: { owner?: string; repo?: string }, signal?: AbortSignal) {
  const token = localStorage.getItem('project-finder-token');
  const response = await fetch(`${BASE_URL}/rag/stream`, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ question, ...repository }) });
  if (!response.ok || !response.body) throw new Error('Research stream unavailable');
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
  while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const events = buffer.split('\n\n'); buffer = events.pop() || ''; for (const event of events) { if (event.startsWith('data: ')) yield JSON.parse(event.slice(6)); } }
};

export const ingestRepository = async (owner: string, repo: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/ingest/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { method: 'POST' });
  if (!response.ok) throw new Error('Repository indexing failed');
  return response.json();
};

export const startIngestionJob = async (owner: string, repo: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/jobs/ingest/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { method: 'POST' });
  if (!response.ok) throw new Error('Unable to start indexing job');
  return response.json();
};

export const getJobStatus = async (jobId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(jobId)}`);
  if (!response.ok) throw new Error('Unable to read job status');
  return response.json();
};

export const searchRepositoryCode = async (query: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/repositories/code-search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Code search unavailable');
  return response.json();
};

export const fetchIndexedRepository = async (repositoryId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/repositories/indexed/${encodeURIComponent(repositoryId)}`);
  if (!response.ok) throw new Error('Indexed repository unavailable');
  return response.json();
};

export const fetchRepositoryIntelligence = async (owner: string, repo: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/intelligence`);
  if (!response.ok) throw new Error('Repository intelligence unavailable');
  return response.json();
};

export const analyzeRepository = async (repositoryId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/analysis/${repositoryId}`);
  if (!response.ok) throw new Error('Project analysis failed');
  return response.json();
};

export const compareRepositories = async (repositoryIds: string[]): Promise<any> => {
  const response = await fetch(`${BASE_URL}/analysis/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repositoryIds }) });
  if (!response.ok) throw new Error('Project comparison failed');
  return response.json();
};

export const fetchRecommendations = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/recommendations`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Recommendations failed');
  return response.json();
};

export const fetchResearchSessions = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/research`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Research history failed');
  return response.json();
};

export const listMcpTools = async (): Promise<any> => {
  const response = await fetch(`${BASE_URL}/mcp/tools`);
  if (!response.ok) throw new Error('MCP tools unavailable');
  return response.json();
};

export const callMcpTool = async (name: string, args: Record<string, unknown>): Promise<any> => {
  const response = await fetch(`${BASE_URL}/mcp/call`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, arguments: args }) });
  if (!response.ok) throw new Error('MCP tool call failed');
  return response.json();
};

export const createResearchSession = async (token: string, title: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/research`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title }) });
  if (!response.ok) throw new Error('Research session creation failed');
  return response.json();
};

export const fetchSearchHistory = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/search-history`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Search history failed');
  return response.json();
};

export const recordSearchHistory = async (token: string, query: string, platform = 'GitHub', resultCount = 0): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/search-history`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, platform, resultCount }) });
  if (!response.ok) throw new Error('Search history recording failed');
  return response.json();
};

export const fetchCollections = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/collections`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Collections failed');
  return response.json();
};

export const fetchProjectNotes = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/notes`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Notes failed');
  return response.json();
};

export const createCollection = async (token: string, name: string, description = ''): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/collections`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, description }) });
  if (!response.ok) throw new Error('Collection creation failed');
  return response.json();
};

export const saveProjectNote = async (token: string, repoUrl: string, body: string, tags: string[] = []): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/notes`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ repoUrl, body, tags }) });
  if (!response.ok) throw new Error('Note save failed');
  return response.json();
};

export const submitAIFeedback = async (token: string, interactionId: string, feedback: 'up' | 'down'): Promise<any> => {
  const response = await fetch(`${BASE_URL}/feedback/ai/${encodeURIComponent(interactionId)}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ feedback }) });
  if (!response.ok) throw new Error('Feedback submission failed');
  return response.json();
};

export const addProjectToCollection = async (token: string, collectionId: string, projectId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/workspace/collections/${encodeURIComponent(collectionId)}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ projectId }) });
  if (!response.ok) throw new Error('Unable to add project to collection');
  return response.json();
};

export const fetchTrending = async (platform: string = 'GitHub', category: string = 'All'): Promise<Project[]> => {
  // Removed static platform returns to ensure dynamic API calls

  const timestamp = Date.now();
  try {
    const url = `${BASE_URL}/trending?platform=${encodeURIComponent(platform)}&category=${encodeURIComponent(category)}&timestamp=${timestamp}`;
    console.log("BACKEND API TRYING:", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend trending failed`);

    const data = await response.json();
    console.log("BACKEND RESULT COUNT:", Array.isArray(data) ? data.length : 0);
    
    if (!Array.isArray(data)) {
        throw new Error("Backend returned invalid trending format");
    }

    // DATA QUALITY GUARD: Filter out individual generic placeholders instead of failing the whole request
    const filteredTrending = Array.isArray(data) ? data.filter(item => {
      const isGenericLink = (item.html_url === 'https://www.kaggle.com/datasets' || item.html_url === 'https://www.linkedin.com');
      const hasIdentifier = !!(item.slug || (item.html_url && item.html_url.length > 30));
      return !isGenericLink || hasIdentifier;
    }) : [];

    if (filteredTrending.length === 0) {
      console.warn(`[Backend API] ${platform} trending returned only generic data, using curated fallbacks.`);
      throw new Error("Generic data detected in trending"); 
    }

    const trending = filteredTrending.map(mapToFrontendProject);
    writeCache(cacheKey('trending', `${platform}:${category}`), trending);
    return trending;
  } catch (error) {
    console.warn(`[Backend API] ${platform} trending failed, falling back.`, error);
    const cached = readCache<Project[]>(cacheKey('trending', `${platform}:${category}`));
    if (cached?.length) return cached;

    // Keep GitHub Trending live even when the Render proxy is cold or down.
    // GitHub's public API permits browser requests and returns the real records.
    if (platform.toLowerCase() === 'github') {
      const topic = category !== 'All' ? ` topic:${category.toLowerCase()}` : '';
      const githubQuery = encodeURIComponent(`stars:>500 created:>2024-01-01${topic}`);
      const directResponse = await fetch(`https://api.github.com/search/repositories?q=${githubQuery}&sort=stars&order=desc&per_page=30`, { cache: 'no-store' });
      if (!directResponse.ok) throw githubApiError(directResponse.status);
      const directData = await directResponse.json();
      return (directData.items || []).map(mapToFrontendProject);
    }
    

    // Direct Real-Time NPM Trending fallback
    if (platform.toLowerCase() === 'npm') {
      try {
        const npmSearchText = category !== 'All' ? `${category} popularity:total` : 'popularity:1.0';
        const npmUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(npmSearchText)}&size=30`;
        const directResp = await fetch(npmUrl, { cache: 'no-store' });
        if (directResp.ok) {
          const directData = await directResp.json();
          const objects = directData.objects || [];
          if (objects.length > 0) {
            const mapped = objects.map((item: any) => {
              const pkg = item.package || {};
              const downloads = item.downloads?.weekly || (item.score?.detail?.popularity ? Math.round(item.score.detail.popularity * 1000000) : 0);
              return mapToFrontendProject({
                id: `npm-${pkg.name}`,
                name: pkg.name,
                description: pkg.description || `Official ${pkg.name} package on npm with ${downloads.toLocaleString()} weekly downloads.`,
                html_url: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
                homepage: pkg.links?.homepage || pkg.links?.repository || pkg.links?.npm,
                stargazers_count: downloads,
                language: 'TypeScript',
                topics: Array.isArray(pkg.keywords) ? pkg.keywords.slice(0, 6) : ['npm', 'package'],
                owner: {
                  login: pkg.publisher?.username || pkg.maintainers?.[0]?.username || 'npm-author',
                  avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png',
                  html_url: pkg.publisher?.username ? `https://www.npmjs.com/~${pkg.publisher.username}` : `https://www.npmjs.com/package/${pkg.name}`
                },
                platform: 'npm',
                version: pkg.version
              });
            });
            writeCache(cacheKey('trending', `${platform}:${category}`), mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('[Direct NPM Trending] Failed:', err);
      }
    }

    // Direct Real-Time Kaggle Trending fallback
    if (platform.toLowerCase() === 'kaggle') {
      try {
        const directResp = await fetch(`https://www.kaggle.com/api/v1/datasets/list?sortBy=votes&pageSize=20`, { cache: 'no-store' });
        if (directResp.ok) {
          const directData = await directResp.json();
          if (Array.isArray(directData) && directData.length > 0) {
            const projects = directData.map((d: any) => mapToFrontendProject({
              id: `kaggle-${d.id || d.ref}`,
              name: d.title || (d.ref ? d.ref.split('/')[1] : 'Kaggle Dataset'),
              description: d.subtitle || d.description || `Trending Kaggle dataset with ${(d.voteCount || 0).toLocaleString()} upvotes and ${(d.downloadCount || 0).toLocaleString()} downloads.`,
              html_url: d.url || (d.ref ? `https://www.kaggle.com/datasets/${d.ref}` : `https://www.kaggle.com/datasets`),
              stargazers_count: d.voteCount || 0,
              language: 'Dataset',
              topics: ['Data Science', 'Machine Learning', ...(Array.isArray(d.tags) ? d.tags.map((t: any) => t.name) : [])].filter(Boolean).slice(0, 5),
              owner: {
                login: d.ownerRef || d.creatorUrl || d.ownerName || 'Kaggle',
                avatar_url: d.thumbnailImageUrl || 'https://www.kaggle.com/static/images/site-logo.svg',
                html_url: (d.ownerRef || d.creatorUrl) ? `https://www.kaggle.com/${d.ownerRef || d.creatorUrl}` : 'https://www.kaggle.com'
              },
              platform: 'Kaggle'
            }));
            writeCache(cacheKey('trending', `${platform}:${category}`), projects);
            return projects;
          }
        }
      } catch (err) {
        console.warn('[Direct Kaggle Trending] Failed:', err);
      }
    }

    // Curated discovery fallbacks (No direct API calls)
    if (platform.toLowerCase() === 'hugging face') {
      return [
        { id: 'hf1', name: 'Stable-Diffusion-3-Medium', description: 'Advanced latent diffusion model for high-resolution image synthesis.', platform: 'Hugging Face', url: 'https://huggingface.co/stabilityai/stable-diffusion-3-medium', liveUrl: 'https://huggingface.co/spaces/stabilityai/stable-diffusion', stars: 12500, language: 'Python', tags: ['Diffusers', 'Generative AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf2', name: 'Llama-3-70B-Instruct', description: 'Meta\'s latest high-performance instruction-tuned large language model.', platform: 'Hugging Face', url: 'https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct', liveUrl: 'https://llama.meta.com', stars: 8400, language: 'Python', tags: ['LLM', 'Transformers'], owner: { login: 'MetaAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf3', name: 'Mistral-7B-v0.3', description: 'Upgraded version of the popular Mistral-7B model with improved attention.', platform: 'Hugging Face', url: 'https://huggingface.co/mistralai/Mistral-7B-v0.3', homepage: 'https://mistral.ai', stars: 6200, language: 'Python', tags: ['NLP', 'Mistral'], owner: { login: 'MistralAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf4', name: 'Phi-3-mini-4k-instruct', description: 'Small and powerful language model from Microsoft.', platform: 'Hugging Face', url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct', homepage: 'https://azure.microsoft.com/en-us/products/phi-3', stars: 4500, language: 'Python', tags: ['Edge AI', 'SML'], owner: { login: 'Microsoft', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf5', name: 'YOLOv10-Realtime', description: 'State-of-the-art end-to-end object detection model.', platform: 'Hugging Face', url: 'https://huggingface.co/jameslahm/yolov10', homepage: 'https://github.com/THU-MIG/yolov10', stars: 2100, language: 'Python', tags: ['Computer Vision', 'YOLO'], owner: { login: 'JamesLahm', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf6', name: 'Gemma-7b', description: 'Google\'s open weights model built from the same tech as Gemini.', platform: 'Hugging Face', url: 'https://huggingface.co/google/gemma-7b', homepage: 'https://ai.google.dev/gemma', stars: 9200, language: 'Python', tags: ['Gemma', 'Open'], owner: { login: 'Google', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf7', name: 'OpenELM-270M', description: 'Apple\'s core efficient language model for on-device tasks.', platform: 'Hugging Face', url: 'https://huggingface.co/apple/OpenELM-270M', homepage: 'https://github.com/apple/ml-explore', stars: 1100, language: 'Python', tags: ['Efficient', 'On-device'], owner: { login: 'Apple', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf8', name: 'Whisper-Large-v3', description: 'OpenAI\'s leading speech-to-text model for robust transcription.', platform: 'Hugging Face', url: 'https://huggingface.co/openai/whisper-large-v3', homepage: 'https://openai.com/index/whisper/', stars: 15000, language: 'Python', tags: ['ASR', 'Audio'], owner: { login: 'OpenAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf9', name: 'StarCoder2-15b', description: 'Next generation of open code generation models.', platform: 'Hugging Face', url: 'https://huggingface.co/bigcode/starcoder2-15b', homepage: 'https://www.bigcode-project.org', stars: 3400, language: 'Python', tags: ['Code', 'LLM'], owner: { login: 'BigCode', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf10', name: 'Mojo-Llama', description: 'Incredibly fast Llama implementation in the Mojo programming language.', platform: 'Hugging Face', url: 'https://huggingface.co/modular/mojo-llama', homepage: 'https://www.modular.com/mojo', stars: 800, language: 'Mojo', tags: ['High Performance', 'LLM'], owner: { login: 'Modular', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } }
      ].map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'kaggle') {
      return [
        { id: 'k1', name: "Credit Card Fraud Detection", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud", description: "Anonymized credit card transactions labeled as fraudulent or genuine.", stargazers_count: 13620, language: 'CSV / Data', topics: ['Finance', 'Fraud Detection', 'Classification'], owner: { login: 'mlg-ulb', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/mlg-ulb' } },
        { id: 'k2', name: "Netflix Movies and TV Shows", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/shivamb/netflix-shows", description: "Comprehensive listing of movies and TV shows available on Netflix with cast and ratings.", stargazers_count: 10240, language: 'CSV', topics: ['Entertainment', 'NLP', 'Data Analysis'], owner: { login: 'shivamb', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/shivamb' } },
        { id: 'k3', name: "Chest X-Ray Images (Pneumonia)", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia", description: "5,863 validated X-Ray images across 2 categories (Pneumonia/Normal).", stargazers_count: 7780, language: 'Images', topics: ['Healthcare', 'Deep Learning', 'Computer Vision'], owner: { login: 'paultimothymooney', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/paultimothymooney' } },
        { id: 'k4', name: "Video Game Sales", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/gregorut/videogamesales", description: "Analyze sales data from more than 16,500 video games across global regions.", stargazers_count: 6890, language: 'CSV', topics: ['Gaming', 'Analytics', 'Visualization'], owner: { login: 'gregorut', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/gregorut' } },
        { id: 'k5', name: "Trending YouTube Video Statistics", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/datasnaek/youtube-new", description: "Daily popular YouTube videos across multiple countries with views and likes.", stargazers_count: 6050, language: 'CSV / JSON', topics: ['Media', 'Trends', 'Social'], owner: { login: 'datasnaek', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/datasnaek' } },
        { id: 'k6', name: "Students Performance in Exams", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/spscientist/students-performance-in-exams", description: "Marks secured by high school students in math, reading, and writing exams.", stargazers_count: 5350, language: 'CSV', topics: ['Education', 'Analysis'], owner: { login: 'spscientist', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/spscientist' } },
        { id: 'k7', name: "Google Play Store Apps", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/lava18/google-play-store-apps", description: "Web scraped data of 10,000 Play Store apps for analyzing Android app market.", stargazers_count: 5160, language: 'CSV', topics: ['Mobile', 'Analytics'], owner: { login: 'lava18', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/lava18' } },
        { id: 'k8', name: "Iris Species", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/uciml/iris", description: "The famous botanical benchmark dataset containing 3 species of 50 instances each.", stargazers_count: 5010, language: 'CSV', topics: ['Beginner', 'Classification'], owner: { login: 'uciml', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/uciml' } },
        { id: 'k9', name: "Brazilian E-Commerce Public Dataset by Olist", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce", description: "100,000 anonymized real commercial orders made at Olist Store between 2016 and 2018.", stargazers_count: 4780, language: 'CSV', topics: ['E-Commerce', 'Logistics'], owner: { login: 'olistbr', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com/olistbr' } },
        { id: 'k10', name: "Titanic - Machine Learning from Disaster", platform: 'Kaggle', html_url: "https://www.kaggle.com/competitions/titanic", description: "The legendary competition dataset to predict survival on the Titanic.", stargazers_count: 25000, language: 'CSV', topics: ['Beginner', 'Classification', 'Competition'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com' } }
      ].map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'linkedin') {
      const allLinkedIn = [
        {
          id: 'l1',
          name: 'The Future of AI Agents in Production',
          description: 'Deep-dive analysis on the architectural shift from single LLM prompts to multi-agent autonomous frameworks in enterprise software.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=ai+agents+production',
          stargazers_count: 8500,
          language: 'Engineering Article',
          topics: ['AI', 'AI Agents', 'LLM', 'Python', 'Architecture'],
          owner: {
            login: 'openai',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/openai'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l2',
          name: 'Modern Full-Stack Engineering Roadmap (2025)',
          description: 'Comprehensive guide covering React 19, Next.js Server Components, Rust tooling, and cloud-native backend patterns.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=full+stack+developer+roadmap+2025',
          stargazers_count: 14200,
          language: 'Technical Guide',
          topics: ['Web', 'Full Stack', 'React', 'TypeScript', 'Career'],
          owner: {
            login: 'github',
            avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            html_url: 'https://www.linkedin.com/company/github'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l3',
          name: 'Scaling Distributed Systems to 10M Concurrent Users',
          description: 'Architectural lessons on database sharding, Redis caching strategies, connection pooling, and message broker bottlenecks.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=system+design+scaling+10+million+users',
          stargazers_count: 11800,
          language: 'System Architecture',
          topics: ['Architecture', 'System Design', 'Backend', 'Database'],
          owner: {
            login: 'netflix',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/netflix'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l4',
          name: 'Container Orchestration: Kubernetes vs Docker Swarm in 2025',
          description: 'Practical comparison of Kubernetes operators, service meshes, resource overhead, and developer velocity for mid-sized teams.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=kubernetes+docker+production+devops',
          stargazers_count: 6700,
          language: 'DevOps Deep Dive',
          topics: ['DevOps', 'Docker', 'Kubernetes', 'Cloud'],
          owner: {
            login: 'docker',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/docker'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l5',
          name: 'Building Production-Ready MLOps Pipelines',
          description: 'Automating model retraining, drift detection, feature stores, and automated rollback workflows for LLMs in production.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=mlops+pipeline+machine+learning+production',
          stargazers_count: 5300,
          language: 'MLOps Guide',
          topics: ['AI', 'Machine Learning', 'MLOps', 'Data Science'],
          owner: {
            login: 'google',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/google'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l6',
          name: 'Python 3.13 Free-Threaded Mode & JIT Deep Dive',
          description: 'Benchmark analysis of removing the Global Interpreter Lock (GIL) and testing real CPU concurrency in data processing.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=python+3.13+nogil+jit+compiler',
          stargazers_count: 9100,
          language: 'Performance Analysis',
          topics: ['Python', 'Performance', 'Backend', 'Tools'],
          owner: {
            login: 'python-software-foundation',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/python-software-foundation'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l7',
          name: 'High-Performance APIs with Go and gRPC',
          description: 'Protocol Buffers serialization, multiplexed HTTP/2 streaming, and achieving sub-millisecond latencies under high throughput.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=golang+grpc+high+performance+microservices',
          stargazers_count: 7300,
          language: 'Backend Engineering',
          topics: ['Go', 'gRPC', 'Backend', 'API'],
          owner: {
            login: 'uber',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/uber-com'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l8',
          name: 'Microservices Anti-Patterns: When to Stay with a Modular Monolith',
          description: 'Case studies analyzing distributed transaction complexity, network overhead, and when splitting services hurts development velocity.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=microservices+antipatterns+modular+monolith',
          stargazers_count: 8900,
          language: 'Architecture Review',
          topics: ['Architecture', 'Web', 'Microservices'],
          owner: {
            login: 'aws',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/amazon-web-services'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l9',
          name: 'Why Leading Tech Companies Are Adopting Rust',
          description: 'Memory safety guarantees, zero-cost abstractions, and reduced cloud infrastructure spending with Rust in production.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=rust+programming+big+tech',
          stargazers_count: 9400,
          language: 'Analysis',
          topics: ['Rust', 'Tools', 'Systems'],
          owner: {
            login: 'microsoft',
            avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
            html_url: 'https://www.linkedin.com/company/microsoft'
          },
          platform: 'LinkedIn'
        },
        {
          id: 'l10',
          name: 'Open Source Contribution Guide for Engineers',
          description: 'How to make your first meaningful pull request to major open source projects and stand out in tech recruitment.',
          html_url: 'https://www.linkedin.com/search/results/content/?keywords=open+source+contribution+developers',
          stargazers_count: 12500,
          language: 'Career Guide',
          topics: ['Open Source', 'Community', 'Career'],
          owner: {
            login: 'github',
            avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            html_url: 'https://www.linkedin.com/company/github'
          },
          platform: 'LinkedIn'
        }
      ];
      const filtered = category !== 'All'
        ? allLinkedIn.filter(item => item.topics.some(t => t.toLowerCase() === category.toLowerCase()))
        : allLinkedIn;
      return (filtered.length > 0 ? filtered : allLinkedIn).map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'npm') {
      return [
        { id: 'npm-1', name: "react", platform: 'npm', html_url: "https://www.npmjs.com/package/react", description: "The library for web and native user interfaces.", stargazers_count: 24000000, language: 'JavaScript', topics: ['react', 'ui', 'frontend'], owner: { login: 'facebook', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/react' } },
        { id: 'npm-2', name: "express", platform: 'npm', html_url: "https://www.npmjs.com/package/express", description: "Fast, unopinionated, minimalist web framework for node.", stargazers_count: 32000000, language: 'JavaScript', topics: ['express', 'framework', 'server'], owner: { login: 'expressjs', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/express' } },
        { id: 'npm-3', name: "next", platform: 'npm', html_url: "https://www.npmjs.com/package/next", description: "The React Framework for production web applications.", stargazers_count: 6500000, language: 'TypeScript', topics: ['react', 'nextjs', 'ssr'], owner: { login: 'vercel', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/next' } },
        { id: 'npm-4', name: "typescript", platform: 'npm', html_url: "https://www.npmjs.com/package/typescript", description: "TypeScript is a language for application scale JavaScript development.", stargazers_count: 45000000, language: 'TypeScript', topics: ['typescript', 'compiler', 'language'], owner: { login: 'microsoft', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/typescript' } },
        { id: 'npm-5', name: "vite", platform: 'npm', html_url: "https://www.npmjs.com/package/vite", description: "Next Generation Frontend Tooling. It's fast!", stargazers_count: 14000000, language: 'TypeScript', topics: ['vite', 'bundler', 'frontend'], owner: { login: 'yyx990803', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/vite' } },
        { id: 'npm-6', name: "axios", platform: 'npm', html_url: "https://www.npmjs.com/package/axios", description: "Promise based HTTP client for the browser and node.js.", stargazers_count: 48000000, language: 'JavaScript', topics: ['http', 'ajax', 'promise'], owner: { login: 'jasonsaayman', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/axios' } },
        { id: 'npm-7', name: "tailwindcss", platform: 'npm', html_url: "https://www.npmjs.com/package/tailwindcss", description: "A utility-first CSS framework for rapid UI development.", stargazers_count: 10000000, language: 'JavaScript', topics: ['css', 'tailwind', 'utility'], owner: { login: 'adamwathan', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/tailwindcss' } },
        { id: 'npm-8', name: "zod", platform: 'npm', html_url: "https://www.npmjs.com/package/zod", description: "TypeScript-first schema validation with static type inference.", stargazers_count: 12000000, language: 'TypeScript', topics: ['typescript', 'schema', 'validation'], owner: { login: 'colinhacks', avatar_url: 'https://static-production.npmjs.com/58a19602f36fa97d1a703d3e01d4d800.png', html_url: 'https://www.npmjs.com/package/zod' } }
      ].map(mapToFrontendProject);
    }

    // Default trending fallback for GitHub (Actual High-Quality Repos with REAL Homepages)
    return [
      { id: 'gt1', name: 'Auto-GPT', description: 'An experimental open-source attempt to make GPT-4 fully autonomous.', platform: 'GitHub', url: 'https://github.com/Significant-Gravitas/Auto-GPT', liveUrl: 'https://agpt.co/', stars: 154000, language: 'Python', tags: ['AI', 'Autonomous'], owner: { login: 'Significant-Gravitas', avatar_url: 'https://github.com/Significant-Gravitas.png' } },
      { id: 'gt2', name: 'Next.js', description: 'The React Framework for the Web.', platform: 'GitHub', url: 'https://github.com/vercel/next.js', liveUrl: 'https://nextjs.org', stars: 120000, language: 'TypeScript', tags: ['React', 'Framework'], owner: { login: 'vercel', avatar_url: 'https://github.com/vercel.png' } },
      { id: 'gt3', name: 'Tailwind CSS', description: 'A utility-first CSS framework for rapid UI development.', platform: 'GitHub', url: 'https://github.com/tailwindlabs/tailwindcss', liveUrl: 'https://tailwindcss.com', stars: 78000, language: 'CSS', tags: ['Utility', 'CSS'], owner: { login: 'tailwindlabs', avatar_url: 'https://github.com/tailwindlabs.png' } },
      { id: 'gt4', name: 'FastAPI', description: 'Modern, fast (high-performance), web framework for building APIs with Python.', platform: 'GitHub', url: 'https://github.com/tiangolo/fastapi', liveUrl: 'https://fastapi.tiangolo.com', stars: 65000, language: 'Python', tags: ['API', 'Speed'], owner: { login: 'tiangolo', avatar_url: 'https://github.com/tiangolo.png' } },
      { id: 'gt5', name: 'Excalidraw', description: 'Virtual whiteboard for sketching hand-drawn like diagrams.', platform: 'GitHub', url: 'https://github.com/excalidraw/excalidraw', liveUrl: 'https://excalidraw.com', stars: 72000, language: 'TypeScript', tags: ['Drawing', 'Collaboration'], owner: { login: 'excalidraw', avatar_url: 'https://github.com/excalidraw.png' } },
      { id: 'gt6', name: 'Prisma', description: 'Next-generation ORM for Node.js & TypeScript.', platform: 'GitHub', url: 'https://github.com/prisma/prisma', liveUrl: 'https://www.prisma.io', stars: 35000, language: 'TypeScript', tags: ['ORM', 'Database'], owner: { login: 'prisma', avatar_url: 'https://github.com/prisma.png' } },
      { id: 'gt7', name: 'Zustand', description: '🐻 Bear necessities for state management in React.', platform: 'GitHub', url: 'https://github.com/pmndrs/zustand', liveUrl: 'https://zustand-demo.pmnd.rs/', stars: 40000, language: 'TypeScript', tags: ['State', 'React'], owner: { login: 'pmndrs', avatar_url: 'https://github.com/pmndrs.png' } },
      { id: 'gt8', name: 'Shadcn/UI', description: 'Beautifully designed components built with Radix UI and Tailwind CSS.', platform: 'GitHub', url: 'https://github.com/shadcn/ui', liveUrl: 'https://ui.shadcn.com', stars: 58000, language: 'TypeScript', tags: ['UI', 'Components'], owner: { login: 'shadcn', avatar_url: 'https://github.com/shadcn.png' } },
      { id: 'gt9', name: 'Bun', description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.', platform: 'GitHub', url: 'https://github.com/oven-sh/bun', liveUrl: 'https://bun.sh', stars: 68000, language: 'Zig', tags: ['Runtime', 'JS'], owner: { login: 'oven', avatar_url: 'https://github.com/oven-sh.png' } },
      { id: 'gt10', name: 'Turborepo', description: 'The high-performance build system for JavaScript and TypeScript monorepos.', platform: 'GitHub', url: 'https://github.com/vercel/turborepo', liveUrl: 'https://turbo.build/repo', stars: 22000, language: 'Go', tags: ['Build', 'Monorepo'], owner: { login: 'vercel', avatar_url: 'https://github.com/vercel.png' } }
    ].map(mapToFrontendProject);
  }
};

export const searchGitHubReadmes = async (category: string = 'All'): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/readmes?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('README search failed');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (Array.isArray(data?.favorites) ? data.favorites : []);
    return list.map(mapToFrontendProject);
  } catch (error) {
    console.error('README search error:', error);
    return [];
  }
};

export const searchGitHubUsers = async (query: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/users?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('User search failed');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (Array.isArray(data?.favorites) ? data.favorites : []);
    return list.map(mapToFrontendProject);
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
};

export const fetchProjectReadme = async (url: string): Promise<string> => {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return '';
    const [_, owner, repoRaw] = match;
    const repo = repoRaw.replace(/\.git$/, '');

    // Try backend proxy first
    try {
      const response = await fetch(`${BASE_URL}/readme/${owner}/${repo}`);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) return text;
      }
    } catch {
      // proxy failed, try direct github api
    }

    // Direct GitHub public API fallback
    const directResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
    if (directResp.ok) {
      return await directResp.text();
    }
    return '';
  } catch (error) {
    console.error('Fetch README error:', error);
    return '';
  }
};

export const fetchGitHubUserProfile = async (username: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};
export const updateCollection = async (token: string, id: string, name: string): Promise<any> => { const response = await fetch(`${BASE_URL}/workspace/collections/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name }) }); if (!response.ok) throw new Error('Collection update failed'); return response.json(); };
export const deleteCollection = async (token: string, id: string): Promise<void> => { const response = await fetch(`${BASE_URL}/workspace/collections/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error('Collection deletion failed'); };
export const removeProjectFromCollection = async (token: string, collectionId: string, projectId: string): Promise<any> => { const response = await fetch(`${BASE_URL}/workspace/collections/${encodeURIComponent(collectionId)}/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error('Project removal failed'); return response.json(); };

export const fetchResearchSession = async (token: string, sessionId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/research/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Research session loading failed');
  return response.json();
};

export const deleteResearchSession = async (token: string, sessionId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/research/${encodeURIComponent(sessionId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Research session deletion failed');
};

export const renameResearchSession = async (token: string, sessionId: string, title: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/research/${encodeURIComponent(sessionId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title }) });
  if (!response.ok) throw new Error('Research session rename failed');
  return response.json();
};

export const recordFirebaseSearchHistory = async (uid: string, query: string, platform = 'GitHub', resultCount = 0): Promise<void> => {
  if (!db || !uid) return;
  const ref = doc(db, 'userSearchHistory', uid); const snapshot = await getDoc(ref);
  const current = snapshot.exists() && Array.isArray(snapshot.data().items) ? snapshot.data().items : [];
  const items = [{ query, platform, resultCount, createdAt: new Date().toISOString() }, ...current.filter((item: any) => item.query !== query)].slice(0, 50);
  await setDoc(ref, { items, updatedAt: new Date().toISOString() }, { merge: true });
};

export const fetchFirebaseSearchHistory = async (uid: string): Promise<any[]> => {
  if (!db || !uid) return [];
  const snapshot = await getDoc(doc(db, 'userSearchHistory', uid));
  return snapshot.exists() && Array.isArray(snapshot.data().items) ? snapshot.data().items : [];
};

export const fetchGithubStarred = async (username: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${encodeURIComponent(username)}/starred`, { cache: 'no-store' });
    if (response.ok) return response.json();
  } catch { /* Try GitHub directly below when the Render proxy is unavailable. */ }

  const directResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=30`, { cache: 'no-store' });
  if (!directResponse.ok) {
    if (directResponse.status === 404) throw new Error('GitHub username not found');
    if (directResponse.status === 403) throw new Error('GitHub rate limit reached. Try again later.');
    throw new Error('Unable to load GitHub starred repositories');
  }
  return directResponse.json();
};

export const saveProject = async (project: Project, token: string): Promise<Project | null> => {
  try {
    const response = await fetch(`${BASE_URL}/save`, {
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
    const response = await fetch(`${BASE_URL}/user/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Favorites fetch failed');
    const data = await response.json();
    const list = Array.isArray(data) ? data : (Array.isArray(data?.favorites) ? data.favorites : []);
    return list.map(mapToFrontendProject);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return [];
  }
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
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

export const fetchCurrentUser = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Session expired');
  return response.json();
};

export const signupUser = async (username: string, email: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
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

export const requestPasswordReset = async (email: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  if (!response.ok) throw new Error('Unable to request password reset');
  return response.json();
};

export const resetPassword = async (token: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.message || 'Unable to reset password'); }
  return response.json();
};

export const verifyEmail = async (token: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/verify-email/${encodeURIComponent(token)}`);
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.message || 'Unable to verify email'); }
  return response.json();
};

export const resendVerification = async (email: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/resend-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  if (!response.ok) throw new Error('Unable to resend verification');
  return response.json();
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
export const createChatStream = async function* (history: any[], message: string, isFastMode: boolean = false) {
  const timestamp = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/chat?timestamp=${timestamp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message, isFastMode })
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
      return;
    }
    throw new Error('Chat API not available');
  } catch (error) {
    console.warn("[Chat API] Backend failed, using local simulation", error);
    
    // Fallback simulation (Simulated Streaming)
    const mockResponses = [
      "Hello! I am TECHBOY AI, your research assistant. ",
      "I see you're interested in building something great. ",
      "How can I help you explore projects today?"
    ];
    
    for (const chunk of mockResponses) {
      await new Promise(r => setTimeout(r, 400));
      yield chunk;
    }
  }
};


const AI_API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api/ai' 
  : 'https://project-finder-api.onrender.com/api/ai';

export const fetchAIResponse = async (prompt: string, context: any): Promise<string> => {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context })
    });
    if (!response.ok) throw new Error("AI request failed");
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("AI Error:", error);
    throw error; // Let the component handle the fallback
  }
};
