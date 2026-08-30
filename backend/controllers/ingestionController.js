import Repository from '../models/Repository.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { getRepositoryIntelligence, getFileContent } from '../services/githubService.js';
import { extractCodeStructure } from '../services/codeStructure.js';

const splitReadme = (text, maxLength = 1800) => {
  const sections = text.split(/(?=^#{1,6}\s)/m).map(section => section.trim()).filter(Boolean);
  const chunks = [];
  for (const section of sections.length ? sections : [text]) {
    for (let i = 0; i < section.length; i += maxLength) chunks.push(section.slice(i, i + maxLength));
  }
  return chunks.filter(Boolean);
};

export const ingestRepository = async (req, res) => {
  const { owner, repo } = req.params;
  let record;
  try {
    record = await Repository.findOneAndUpdate(
      { provider: 'github', owner, name: repo },
      { $set: { ingestion: { status: 'processing', error: null } }, $setOnInsert: { url: `https://github.com/${owner}/${repo}` } },
      { new: true, upsert: true }
    );
    const intelligence = await getRepositoryIntelligence(owner, repo);
    record.metadata = intelligence.repository;
    record.evidence = intelligence.evidence;
    record.signals = intelligence.signals;
    record.ingestion = { status: 'ready', error: null, completedAt: new Date() };
    await record.save();
    await DocumentChunk.deleteMany({ repositoryId: record._id });
    const chunks = splitReadme(intelligence.evidence.readme).map((content, index) => ({ repositoryId: record._id, sourceType: 'readme', section: `section-${index + 1}`, content, metadata: { owner, repo } }));
    const importantFiles = intelligence.evidence.files.filter(file => /(^|\/)(src|app|server|api|auth|database|config|main|index)/i.test(file) && /\.(js|jsx|ts|tsx|py|go|rs|java|json|toml|yaml|yml)$/.test(file)).slice(0, 20);
    const fileResults = await Promise.allSettled(importantFiles.map(file => getFileContent(owner, repo, file)));
    fileResults.filter(result => result.status === 'fulfilled').forEach(result => {
      const file = result.value;
      const structure = extractCodeStructure(file.content);
      chunks.push(...splitReadme(file.content, 2200).map((content, index) => ({ repositoryId: record._id, sourceType: 'tree', filePath: file.path, section: `block-${index + 1}`, content, metadata: { owner, repo, documentType: 'source-code', structure } })));
    });
    if (chunks.length) await DocumentChunk.insertMany(chunks);
    res.json({ repositoryId: record._id, status: 'ready', chunkCount: chunks.length, signals: record.signals });
  } catch (error) {
    if (record) { record.ingestion = { status: 'failed', error: error.message, completedAt: null }; await record.save().catch(() => {}); }
    res.status(error.status || 500).json({ message: error.message || 'Repository ingestion failed', status: 'failed' });
  }
};
