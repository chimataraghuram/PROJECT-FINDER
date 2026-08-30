import Collection from '../models/Collection.js';
import ProjectNote from '../models/ProjectNote.js';
import SearchQuery from '../models/SearchQuery.js';

export const listCollections = async (req, res) => {
  const collections = await Collection.find({ userId: req.user._id }).populate('projects').sort({ updatedAt: -1 });
  res.json(collections);
};

export const createCollection = async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Collection name is required' });
  const collection = await Collection.create({ userId: req.user._id, name, description: req.body.description || '' });
  res.status(201).json(collection);
};

export const addProjectToCollection = async (req, res) => {
  const collection = await Collection.findOne({ _id: req.params.collectionId, userId: req.user._id });
  if (!collection) return res.status(404).json({ message: 'Collection not found' });
  if (!collection.projects.some(projectId => String(projectId) === String(req.body.projectId))) collection.projects.push(req.body.projectId);
  await collection.save();
  res.json(collection);
};

export const updateCollection = async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  if (!name) return res.status(400).json({ message: 'Collection name is required' });
  const collection = await Collection.findOneAndUpdate({ _id: req.params.collectionId, userId: req.user._id }, { $set: { name } }, { new: true }).populate('projects');
  if (!collection) return res.status(404).json({ message: 'Collection not found' });
  res.json(collection);
};

export const deleteCollection = async (req, res) => {
  const deleted = await Collection.findOneAndDelete({ _id: req.params.collectionId, userId: req.user._id });
  if (!deleted) return res.status(404).json({ message: 'Collection not found' });
  res.status(204).end();
};

export const removeProjectFromCollection = async (req, res) => {
  const collection = await Collection.findOneAndUpdate({ _id: req.params.collectionId, userId: req.user._id }, { $pull: { projects: req.params.projectId } }, { new: true }).populate('projects');
  if (!collection) return res.status(404).json({ message: 'Collection not found' });
  res.json(collection);
};

export const listNotes = async (req, res) => {
  const notes = await ProjectNote.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json(notes);
};

export const upsertNote = async (req, res) => {
  const repoUrl = String(req.body.repoUrl || '').trim();
  const body = String(req.body.body || '').trim();
  if (!repoUrl || !body) return res.status(400).json({ message: 'repoUrl and body are required' });
  const note = await ProjectNote.findOneAndUpdate(
    { userId: req.user._id, repoUrl },
    { $set: { body, tags: Array.isArray(req.body.tags) ? req.body.tags.slice(0, 20) : [] } },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(note);
};

export const listSearchHistory = async (req, res) => res.json(await SearchQuery.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100).lean());

export const recordSearch = async (req, res) => {
  const query = String(req.body.query || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  const item = await SearchQuery.create({ userId: req.user._id, query, platform: String(req.body.platform || 'GitHub'), filters: req.body.filters || {}, resultCount: Number(req.body.resultCount) || 0 });
  res.status(201).json(item);
};
