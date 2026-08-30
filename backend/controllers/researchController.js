import ResearchSession from '../models/ResearchSession.js';

export const listResearchSessions = async (req, res) => {
  const sessions = await ResearchSession.find({ userId: req.user._id }).select('-messages').sort({ updatedAt: -1 }).limit(50).lean();
  res.json(sessions);
};

export const createResearchSession = async (req, res) => {
  const title = String(req.body.title || 'Technical research').trim().slice(0, 160);
  const session = await ResearchSession.create({ userId: req.user._id, title });
  res.status(201).json(session);
};

export const addResearchMessage = async (req, res) => {
  const session = await ResearchSession.findOne({ _id: req.params.sessionId, userId: req.user._id });
  if (!session) return res.status(404).json({ message: 'Research session not found' });
  session.messages.push({ role: req.body.role === 'assistant' ? 'assistant' : 'user', content: String(req.body.content || '').slice(0, 20000), citations: Array.isArray(req.body.citations) ? req.body.citations.slice(0, 20) : [], latencyMs: Number(req.body.latencyMs) || undefined });
  await session.save();
  res.json(session);
};
