import EvaluationResult from '../models/EvaluationResult.js';

export const listEvaluations = async (req, res) => res.json(await EvaluationResult.find().sort({ createdAt: -1 }).limit(100).lean());
export const recordEvaluation = async (req, res) => {
  const result = await EvaluationResult.create({ dataset: String(req.body.dataset || 'default'), method: req.body.method, metrics: req.body.metrics || {}, sampleCount: Number(req.body.sampleCount) || 0, notes: String(req.body.notes || '').slice(0, 2000) });
  res.status(201).json(result);
};
