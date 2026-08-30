import { getRepositoryIntelligence, searchGithubCode } from '../services/githubService.js';
import Repository from '../models/Repository.js';

export const inspectRepository = async (req, res) => {
  try {
    const result = await getRepositoryIntelligence(req.params.owner, req.params.repo);
    res.json(result);
  } catch (error) {
    res.status(error.status || 502).json({ message: error.message });
  }
};

export const searchCode = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  try { res.json(await searchGithubCode(query)); } catch (error) { res.status(error.status || 502).json({ message: error.message }); }
};

export const getIndexedRepository = async (req, res) => {
  const repository = await Repository.findById(req.params.repositoryId).lean();
  if (!repository) return res.status(404).json({ message: 'Indexed repository not found' });
  res.json(repository);
};
