import Repository from '../models/Repository.js';
import ProjectAnalysis from '../models/ProjectAnalysis.js';
import { scoreRepository } from '../services/projectAnalysis.js';

export const analyzeRepository = async (req, res) => {
  const repo = await Repository.findById(req.params.repositoryId).lean();
  if (!repo) return res.status(404).json({ message: 'Repository not found' });
  const scores = scoreRepository(repo);
  const analysis = await ProjectAnalysis.findOneAndUpdate({ repositoryId: repo._id }, { scores, strengths: [repo.signals?.hasDocumentation && 'Documentation available', repo.signals?.hasTests && 'Test structure detected'].filter(Boolean), limitations: [!repo.signals?.hasTests && 'Tests could not be detected', !repo.signals?.hasDocumentation && 'Documentation could not be detected'].filter(Boolean) }, { new: true, upsert: true, runValidators: true });
  res.json({ heuristic: true, analysis });
};

export const compareRepositories = async (req, res) => {
  const ids = Array.isArray(req.body.repositoryIds) ? req.body.repositoryIds.slice(0, 5) : [];
  if (ids.length < 2) return res.status(400).json({ message: 'At least two repositoryIds are required' });
  const repos = await Repository.find({ _id: { $in: ids } }).lean();
  res.json({ heuristic: true, projects: repos.map(repo => ({ repository: { id: repo._id, owner: repo.owner, name: repo.name, url: repo.url }, scores: scoreRepository(repo), technologies: repo.metadata?.topics || [], language: repo.metadata?.language || null })) });
};
