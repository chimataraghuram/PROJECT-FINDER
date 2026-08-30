import { Project, SearchResult, GroundingSource } from "../types";
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api' 
  : 'https://project-finder-api.onrender.com/api';

// Mapping helper to ensure UI stability
const mapToFrontendProject = (item: any): Project => {
  // Defensive mapping to handle both backend and hardcoded fallback shapes
  const name = item.name || 'Unknown Project';
  const platform = item.platform || 'GitHub';
  let repoUrl = item.html_url || item.url || '#';
  
  if (platform === 'GitHub') {
    // Ensure GitHub links use html_url and are full paths
    if (repoUrl !== '#' && !repoUrl.startsWith('http')) {
      repoUrl = `https://github.com/${repoUrl}`;
    }
  }

  // FINAL SAFETY: Hide buttons if URL is missing or invalid (no https://)
  if (repoUrl !== '#' && !repoUrl.startsWith('https://')) {
    repoUrl = '#';
  }
  
    const stars = item.stargazers_count !== undefined ? item.stargazers_count : (item.stars || 0);
    const topics = item.topics || item.tags || [];
    
    // Improved Live URL extraction (prioritize official homepages)
    const liveUrl = (item.homepage && item.homepage !== repoUrl && item.homepage !== '#') ? item.homepage : 
                   (item.liveUrl && item.liveUrl !== repoUrl && item.liveUrl !== '#') ? item.liveUrl : 
                   (item.demoUrl && item.demoUrl !== repoUrl && item.demoUrl !== '#') ? item.demoUrl : null;
    
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
    owner: item.owner ? {
      login: item.owner.login || 'Owner',
      avatar_url: item.owner.avatar_url || '',
      html_url: (item.owner.html_url && item.owner.html_url !== '#') ? item.owner.html_url : (
        platform === 'GitHub' ? `https://github.com/${item.owner.login || 'Owner'}` :
        platform === 'Kaggle' ? `https://www.kaggle.com/${item.owner.login || 'Owner'}` :
        platform === 'Hugging Face' ? `https://huggingface.co/${item.owner.login || 'Owner'}` :
        platform === 'LinkedIn' ? (item.owner.login ? `https://www.linkedin.com/in/${item.owner.login}` : 'https://www.linkedin.com') : '#'
      )
    } : { login: 'Community', avatar_url: '', html_url: '#' },
    slug: item.slug || null,
    image: item.owner?.avatar_url || null,
    readme: item.description || ''
  };
};

// Service functions continue below...

export const fetchSearch = async (query: string, category: string = 'All', platform: string = 'GitHub'): Promise<SearchResult> => {
  // Removed static platform returns to ensure dynamic API calls

  const timestamp = Date.now();
  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&platform=${encodeURIComponent(platform)}`;
    console.log("BACKEND API TRYING (Search):", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend search failed`);
    
    const data = await response.json();
    console.log("BACKEND SEARCH RESULT COUNT:", Array.isArray(data) ? data.length : 0);
    
    // DATA QUALITY GUARD: Identify generic placeholders (no specific project ID/slug)
    const filteredData = Array.isArray(data) ? data.filter(item => {
      // Allow mock results even if URLs are generic, as long as they have a name
      const isGenericLink = (item.html_url === 'https://www.kaggle.com/datasets' || item.html_url === 'https://www.linkedin.com');
      const hasContent = !!(item.name && item.name.length > 2);
      
      return !isGenericLink || hasContent;
    }) : [];

    if (filteredData.length === 0) {
        throw new Error("No high-quality results from API (generic or empty response)");
    }
    const platformOrder: Record<string, number> = { 'GitHub': 0, 'Hugging Face': 1, 'Kaggle': 2, 'LinkedIn': 3 };
    const projects = filteredData
      .map(mapToFrontendProject)
      .sort((a, b) => (platformOrder[a.platform] ?? 99) - (platformOrder[b.platform] ?? 99));
    
    return {
      summary: `Found ${projects.length} results for "${query}" on ${platform}${category !== 'All' ? ` in ${category}` : ''}.`,
      projects,
      groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  } catch (error) {
    console.warn(`[Backend API] Search for ${platform} failed or returned low-quality data, using curated fallbacks.`, error);
    
    // Curated discovery fallbacks for SEARCH results (Phase 24 - specific URLs)
    let fallbackProjects: any[] = [];
    if (platform.toLowerCase() === 'hugging face') {
      fallbackProjects = [
        { id: 'hf-s1', name: `Stable-Diffusion-WebUI`, description: `Browser interface based on Gradio library for Stable Diffusion.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion', stargazers_count: 54000, language: 'Python', topics: [query, 'AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co/StabilityAI' } },
        { id: 'hf-s2', name: `${query} Model`, description: `Specialized AI model related to "${query}" found on Hugging Face.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/models', stargazers_count: 12000, language: 'PyTorch', topics: [query, 'LLM'], owner: { login: 'HF-Community', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co' } }
      ];
    } else if (platform.toLowerCase() === 'kaggle') {
      fallbackProjects = [
        { id: 'kg-s1', name: `${query} Dataset`, description: `Large-scale dataset for ${query} research and analysis.`, platform: 'Kaggle', html_url: 'https://www.kaggle.com/datasets', stargazers_count: 8500, language: 'CSV', topics: [query, 'Data'], owner: { login: 'KaggleData', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com' } }
      ];
    } else if (platform.toLowerCase() === 'linkedin') {
      fallbackProjects = [
        { id: 'li-s1', name: `${query} Professional Groups`, description: `Connect with specialized LinkedIn groups focusing on ${query}.`, platform: 'LinkedIn', html_url: 'https://www.linkedin.com/groups/', stargazers_count: 25000, language: 'Community', topics: [query, 'Networking'], owner: { login: 'LinkedIn', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca', html_url: 'https://www.linkedin.com' } }
      ];
    } else if (platform.toLowerCase() === 'all') {
      // Mixed platform fallback for "All" - Use REAL high-quality repos
      fallbackProjects = [
        { id: 'as-1', name: 'LangChain', description: `Building applications with LLMs through composability.`, platform: 'GitHub', html_url: `https://github.com/langchain-ai/langchain`, homepage: 'https://langchain.com', stargazers_count: 85000, language: 'Python', topics: ['AI', 'LLM', 'Framework'], owner: { login: 'langchain-ai', avatar_url: 'https://github.com/langchain-ai.png' } },
        { id: 'as-2', name: `Transformers`, description: `State-of-the-art Machine Learning for Pytorch, TensorFlow, and JAX.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/docs/transformers', stargazers_count: 125000, language: 'Python', topics: ['NLP', 'Deep Learning'], owner: { login: 'HuggingFace', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'as-3', name: `House Prices`, description: `Advanced regression techniques for house price prediction.`, platform: 'Kaggle', html_url: 'https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques', stargazers_count: 15000, language: 'Python', topics: ['Regression', 'ML'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } }
      ];
    } else {
      // Specific GitHub search fallbacks - NO MORE GENERIC SEARCH LINKS
      fallbackProjects = [
        { id: 'gs-1', name: 'Auto-GPT', description: `An experimental open-source attempt to make GPT-4 fully autonomous.`, platform: 'GitHub', html_url: `https://github.com/Significant-Gravitas/Auto-GPT`, homepage: 'https://agpt.co/', stargazers_count: 154000, language: 'Python', topics: ['AI', 'Autonomous', 'GPT-4'], owner: { login: 'Significant-Gravitas', avatar_url: 'https://github.com/Significant-Gravitas.png' } },
        { id: 'gs-2', name: `PyTorch`, description: `Tensors and Dynamic neural networks in Python with strong GPU acceleration.`, platform: 'GitHub', html_url: `https://github.com/pytorch/pytorch`, homepage: 'https://pytorch.org', stargazers_count: 78000, language: 'C++', topics: ['Machine Learning', 'AI', 'Compute'], owner: { login: 'pytorch', avatar_url: 'https://github.com/pytorch.png' } }
      ];
    }

    const finalProjects = [...fallbackProjects];
    while (finalProjects.length > 0 && finalProjects.length < 10) {
      finalProjects.push({ ...finalProjects[finalProjects.length % fallbackProjects.length], id: `${finalProjects[0].id}_${finalProjects.length}` });
    }

    const mapped = finalProjects.map(mapToFrontendProject);
    return {
      summary: `Providing curated discovery for ${platform} matching "${query}".`,
      projects: mapped,
      groundingSources: mapped.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  }
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

    return filteredTrending.map(mapToFrontendProject);
  } catch (error) {
    console.warn(`[Backend API] ${platform} trending failed, falling back.`, error);

    // Keep GitHub Trending live even when the Render proxy is cold or down.
    // GitHub's public API permits browser requests and returns the real records.
    if (platform.toLowerCase() === 'github') {
      const topic = category !== 'All' ? ` topic:${category.toLowerCase()}` : '';
      const githubQuery = encodeURIComponent(`stars:>500 created:>2024-01-01${topic}`);
      const directResponse = await fetch(`https://api.github.com/search/repositories?q=${githubQuery}&sort=stars&order=desc&per_page=30`, { cache: 'no-store' });
      if (!directResponse.ok) throw error;
      const directData = await directResponse.json();
      return (directData.items || []).map(mapToFrontendProject);
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
        { id: 'k1', name: "Titanic - Machine Learning from Disaster", platform: 'Kaggle', html_url: "https://www.kaggle.com/competitions/titanic", description: "The classic ML competition to predict survival on the Titanic.", stargazers_count: 25000, language: 'CSV', topics: ['ML', 'Competition'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k2', name: "House Prices - Advanced Regression", platform: 'Kaggle', html_url: "https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques", description: "Predict sales prices and practice feature engineering.", stargazers_count: 15000, language: 'Python', topics: ['Regression', 'ML'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k3', name: "MNIST Handwritten Digits Dataset", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/hojjatk/mnist-dataset", description: "The legendary computer vision dataset of handwritten digits.", stargazers_count: 12000, language: 'Images', topics: ['Computer Vision', 'Deep Learning'], owner: { login: 'HojjatK', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k4', name: "Netflix Movies and TV Shows Dataset", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/shivamb/netflix-shows", description: "List of movies and TV shows on Netflix as of 2021.", stargazers_count: 9800, language: 'JSON', topics: ['Entertainment', 'NLP'], owner: { login: 'ShivamB', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k5', name: "COVID-19 Global Dataset", platform: 'Kaggle', html_url: "https://www.kaggle.com/datasets/imdevskp/corona-virus-report", description: "Daily reports on global COVID-19 cases and trends.", stargazers_count: 5400, language: 'CSV', topics: ['Health', 'Data Viz'], owner: { login: 'ImDevSKP', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } }
      ].map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'linkedin') {
      return [
        { id: 'l1', name: "Explore Developer Community on LinkedIn", platform: 'LinkedIn', html_url: "https://www.linkedin.com/groups/", description: "Connect with professional developer groups worldwide.", stargazers_count: 12000, language: 'Community', topics: ['Networking', 'Career'], owner: { login: 'LinkedIn', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l2', name: "Latest Tech Posts Feed", platform: 'LinkedIn', html_url: "https://www.linkedin.com/feed/", description: "Stay updated with the latest trends in the tech industry.", stargazers_count: 8500, language: 'Feed', topics: ['Tech', 'News'], owner: { login: 'LinkedIn', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l3', name: "AI & ML Discussions", platform: 'LinkedIn', html_url: "https://www.linkedin.com/groups/6671666/", description: "Deep dives into Artificial Intelligence and Machine Learning.", stargazers_count: 6700, language: 'Group', topics: ['AI', 'ML'], owner: { login: 'AI Professionals', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l4', name: "Software Developer Network", platform: 'LinkedIn', html_url: "https://www.linkedin.com/groups/37787/", description: "One of the largest groups for software engineers on LinkedIn.", stargazers_count: 21000, language: 'Group', topics: ['Software', 'Engineering'], owner: { login: 'DevNetwork', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l5', name: "Data Science Community", platform: 'LinkedIn', html_url: "https://www.linkedin.com/groups/129459/", description: "Professional group for data scientists and analysts.", stargazers_count: 15000, language: 'Group', topics: ['Data Science', 'Big Data'], owner: { login: 'DataScience', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } }
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
    return data.map(mapToFrontendProject);
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
    const response = await fetch(`${BASE_URL}/readme/${owner}/${repo}`);
    if (!response.ok) return '';
    return await response.text();
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
    return data.map(mapToFrontendProject);
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
