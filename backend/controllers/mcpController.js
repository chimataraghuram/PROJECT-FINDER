import { deepSearch } from './deepSearchController.js';
import { getRepositoryIntelligence } from '../services/githubService.js';
import { searchGithubCode } from '../services/githubService.js';
import Repository from '../models/Repository.js';
import { scoreRepository } from '../services/projectAnalysis.js';

export const listMcpTools = (req, res) => res.json({ tools: [
  { name: 'search_projects', description: 'Search indexed technical repositories with lexical evidence.', inputSchema: { type: 'object', properties: { q: { type: 'string' }, limit: { type: 'number' } }, required: ['q'] } },
  { name: 'get_repository_intelligence', description: 'Inspect a public GitHub repository and return evidence.', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } }, required: ['owner', 'repo'] } },
  { name: 'analyze_project', description: 'Calculate heuristic project-quality signals for an indexed repository.', inputSchema: { type: 'object', properties: { repositoryId: { type: 'string' } }, required: ['repositoryId'] } }
  ,{ name: 'search_repository_code', description: 'Search permitted public GitHub code and return file evidence.', inputSchema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } }
] });

export const callMcpTool = async (req, res) => {
  const { name, arguments: args = {} } = req.body;
  if (name === 'get_repository_intelligence') return res.json(await getRepositoryIntelligence(args.owner, args.repo));
  if (name === 'search_repository_code') return res.json(await searchGithubCode(args.q));
  if (name === 'analyze_project') {
    const repo = await Repository.findById(args.repositoryId).lean();
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    return res.json({ heuristic: true, repositoryId: repo._id, scores: scoreRepository(repo) });
  }
  if (name === 'search_projects') {
    req.query = { q: args.q, limit: args.limit };
    return deepSearch(req, res);
  }
  return res.status(400).json({ error: `Unknown tool: ${name}` });
};
