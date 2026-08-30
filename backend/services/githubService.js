import axios from 'axios';

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
  },
  timeout: 15000
});
const intelligenceCache = new Map();
const INTELLIGENCE_TTL = 10 * 60 * 1000;

const request = async (path) => (await github.get(path)).data;
export const getFileContent = async (owner, repo, path) => {
  const data = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`);
  return { path, content: Buffer.from(data.content || '', 'base64').toString('utf8') };
};

export const getRepositoryIntelligence = async (owner, repo) => {
  const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const cached = intelligenceCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < INTELLIGENCE_TTL) return cached.value;
  const [metadata, readme, tree, releases] = await Promise.allSettled([
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`),
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`),
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=5`)
  ]);

  if (metadata.status === 'rejected') {
    const status = metadata.reason?.response?.status;
    const error = new Error(status === 404 ? 'Repository not found' : 'GitHub repository lookup failed');
    error.status = status || 502;
    throw error;
  }

  const info = metadata.value;
  const files = tree.status === 'fulfilled' ? tree.value.tree.filter(item => item.type === 'blob').map(item => item.path) : [];
  const readmeText = readme.status === 'fulfilled' ? Buffer.from(readme.value.content || '', 'base64').toString('utf8') : '';
  const evidence = {
    metadata: { topics: info.topics || [], language: info.language, license: info.license?.spdx_id || null, stars: info.stargazers_count, forks: info.forks_count, updatedAt: info.updated_at },
    readme: readmeText,
    files,
    releases: releases.status === 'fulfilled' ? releases.value.map(item => ({ name: item.name, tag: item.tag_name, publishedAt: item.published_at })) : []
  };

  const dependencyFiles = files.filter(file => /(^|\/)(package\.json|requirements.*\.txt|pyproject\.toml|poetry\.lock|pom\.xml|go\.mod|Cargo\.toml|Gemfile|composer\.json)$/.test(file));
  const configFiles = files.filter(file => /(^|\/)(Dockerfile|docker-compose.*|\.github\/workflows\/|\.env\.example|vercel\.json|render\.yaml|fly\.toml)/.test(file));
  const value = { repository: info, evidence, signals: { dependencyFiles, configFiles, hasTests: files.some(file => /(^|\/)(test|tests|__tests__)\//i.test(file)), hasDocumentation: Boolean(readmeText) } };
  if (intelligenceCache.size >= 200) intelligenceCache.delete(intelligenceCache.keys().next().value);
  intelligenceCache.set(cacheKey, { value, createdAt: Date.now() });
  return value;
};

export const searchGithubCode = async query => {
  if (!process.env.GITHUB_TOKEN) { const error = new Error('GITHUB_TOKEN is required for code search'); error.status = 503; throw error; }
  const data = await request(`/search/code?q=${encodeURIComponent(query)}&per_page=30`);
  return { total: data.total_count, results: data.items.map(item => ({ repository: item.repository.full_name, path: item.path, url: item.html_url, evidenceType: 'source-code' })) };
};
