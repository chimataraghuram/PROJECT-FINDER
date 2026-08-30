import Repository from '../models/Repository.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { understandQuery } from '../services/queryUnderstanding.js';
import { rankChunksSemantically } from '../services/semanticSearch.js';

const terms = query => [...new Set(String(query).toLowerCase().match(/[a-z0-9+#.-]{2,}/g) || [])].slice(0, 20);

export const deepSearch = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  const tokens = terms(query);
  const intent = understandQuery(query);
  const requestedLanguage = String(req.query.language || '').toLowerCase();
  const requestedFramework = String(req.query.framework || '').toLowerCase();
  const requiresTests = req.query.hasTests === 'true';
  const requiresDocs = req.query.hasDocumentation === 'true';
  const repositories = await Repository.find({ 'ingestion.status': 'ready' }).limit(500).lean();
  const results = repositories.map(repo => {
    const text = JSON.stringify({ metadata: repo.metadata, evidence: repo.evidence, signals: repo.signals }).toLowerCase();
    const matched = tokens.filter(token => text.includes(token));
    if (requestedLanguage && String(repo.metadata?.language || '').toLowerCase() !== requestedLanguage) return null;
    if (requestedFramework && !text.includes(requestedFramework)) return null;
    if (requiresTests && !repo.signals?.hasTests) return null;
    if (requiresDocs && !repo.signals?.hasDocumentation) return null;
    if (!matched.length) return null;
    const reasons = matched.map(token => {
      if (JSON.stringify(repo.metadata || {}).toLowerCase().includes(token)) return `${token} detected in repository metadata`;
      if (JSON.stringify(repo.signals || {}).toLowerCase().includes(token)) return `${token} detected in repository structure/configuration`;
      return `${token} detected in README evidence`;
    });
    return {
      repository: { id: repo._id, name: repo.name, owner: repo.owner, url: repo.url, description: repo.metadata?.description || '' },
      score: Math.min(100, Math.round((matched.length / tokens.length) * 80 + (repo.signals?.hasTests ? 5 : 0) + (repo.signals?.hasDocumentation ? 5 : 0) + (intent.portfolioRelevance && repo.metadata?.stargazers_count > 100 ? 5 : 0))),
      matchedTerms: matched,
      whyMatches: reasons,
      evidence: { sourceTypes: ['metadata', 'readme', 'tree'].filter(type => JSON.stringify(repo).toLowerCase().includes(type)) }
    };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, Math.min(Number(req.query.limit) || 20, 50));
  res.json({ query, intent, retrieval: 'lexical', filters: { language: requestedLanguage || null, framework: requestedFramework || null, hasTests: requiresTests, hasDocumentation: requiresDocs }, total: results.length, results });
};

export const searchChunks = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  const tokens = terms(query);
  const chunks = await DocumentChunk.find({ $text: { $search: query } }).limit(20).lean().catch(() => []);
  const safePattern = tokens.map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const fallback = chunks.length ? chunks : await DocumentChunk.find({ content: { $regex: safePattern, $options: 'i' } }).limit(20).lean();
  const ranked = rankChunksSemantically(query, fallback);
  res.json({ query, retrieval: 'semantic-local-baseline', chunks: ranked.map(chunk => ({ id: chunk._id, repositoryId: chunk.repositoryId, sourceType: chunk.sourceType, filePath: chunk.filePath, section: chunk.section, content: chunk.content, semanticScore: Number(chunk.semanticScore.toFixed(4)) })) });
};

export const hybridSearch = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  const tokens = terms(query);
  const [repositories, chunks] = await Promise.all([
    Repository.find({ 'ingestion.status': 'ready' }).limit(500).lean(),
    DocumentChunk.find({ $text: { $search: query } }).limit(100).lean().catch(() => [])
  ]);
  const semantic = rankChunksSemantically(query, chunks);
  const semanticByRepo = new Map();
  semantic.forEach(chunk => {
    const key = String(chunk.repositoryId);
    semanticByRepo.set(key, Math.max(semanticByRepo.get(key) || 0, chunk.semanticScore));
  });
  const results = repositories.map(repo => {
    const text = JSON.stringify(repo).toLowerCase();
    const lexical = tokens.filter(token => text.includes(token)).length / Math.max(tokens.length, 1);
    const semanticScore = semanticByRepo.get(String(repo._id)) || 0;
    if (!lexical && !semanticScore) return null;
    const fused = lexical * 0.55 + semanticScore * 0.45;
    return { repository: { id: repo._id, owner: repo.owner, name: repo.name, url: repo.url }, score: Number((fused * 100).toFixed(2)), scoreComponents: { lexical: Number((lexical * 100).toFixed(2)), semantic: Number((semanticScore * 100).toFixed(2)) }, matchedTerms: tokens.filter(token => text.includes(token)) };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, Math.min(Number(req.query.limit) || 20, 50));
  res.json({ query, retrieval: 'hybrid-fusion', weights: { lexical: 0.55, semantic: 0.45 }, total: results.length, results });
};
