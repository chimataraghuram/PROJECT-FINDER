import { understandQuery } from '../services/queryUnderstanding.js';

export const parseQuery = (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required' });
  res.json(understandQuery(query));
};
