import Repository from '../models/Repository.js';

export const classify = question => {
  const value = question.toLowerCase();
  if (/language|framework|database|star|fork|created|updated|license|owner/.test(value)) return 'metadata';
  if (/run|install|setup|prerequisite/.test(value)) return 'setup';
  if (/dependenc|package|library/.test(value)) return 'dependencies';
  return 'deep';
};

export const quickResearch = async (req, res) => {
  const question = String(req.body.question || '').trim();
  if (!question) return res.status(400).json({ message: 'Question is required' });
  const repo = req.body.repositoryId ? await Repository.findById(req.body.repositoryId).lean() : await Repository.findOne({ provider: 'github', owner: req.body.owner, name: req.body.repo }).lean();
  if (!repo) return res.status(404).json({ message: 'Repository has not been indexed yet' });
  const category = classify(question);
  const metadata = repo.metadata || {};
  const answer = category === 'metadata'
    ? `Language: ${metadata.language || 'I could not verify this from indexed metadata.'}\nStars: ${metadata.stargazers_count ?? 'Unavailable'}\nForks: ${metadata.forks_count ?? 'Unavailable'}\nLicense: ${metadata.license?.spdx_id || 'Unavailable'}\nLast updated: ${metadata.updated_at || 'Unavailable'}`
    : category === 'dependencies'
      ? `Indexed dependency evidence: ${(repo.signals?.dependencyFiles || []).join(', ') || 'I could not verify dependency files.'}`
      : category === 'setup'
        ? 'Setup instructions must be retrieved from the indexed README. Use Deep Research for a cited setup explanation.'
        : 'This question requires repository research. Use Deep Research for a grounded answer.';
  res.json({ mode: 'quick', category, answer, grounded: true, citations: [{ sourceType: 'metadata', repository: `${repo.owner}/${repo.name}`, url: repo.url }] });
};
