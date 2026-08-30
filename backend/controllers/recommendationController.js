import FavoriteProject from '../models/FavoriteProject.js';
import Repository from '../models/Repository.js';

export const recommendProjects = async (req, res) => {
  const favorites = await FavoriteProject.find({ userId: req.user._id }).lean();
  const interestText = favorites.map(item => `${item.projectName} ${(item.tags || []).join(' ')} ${item.language || ''}`).join(' ').toLowerCase();
  const repositories = await Repository.find({ 'ingestion.status': 'ready' }).sort({ 'metadata.stargazers_count': -1 }).limit(200).lean();
  const recommendations = repositories.map(repo => {
    const text = JSON.stringify(repo).toLowerCase();
    const shared = [...new Set(interestText.match(/[a-z0-9+#.-]{2,}/g) || [])].filter(token => text.includes(token)).slice(0, 5);
    const reasons = shared.map(token => `Shares interest in ${token}`);
    if (repo.signals?.hasDocumentation) reasons.push('Has indexed documentation');
    if (repo.signals?.hasTests) reasons.push('Test structure detected');
    if (!reasons.length) return null;
    return { repository: { id: repo._id, owner: repo.owner, name: repo.name, url: repo.url }, score: Math.min(100, shared.length * 15 + (repo.signals?.hasDocumentation ? 15 : 0) + (repo.signals?.hasTests ? 15 : 0)), reasons };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 20);
  res.json({ personalized: true, basedOnSavedProjects: favorites.length, recommendations });
};
