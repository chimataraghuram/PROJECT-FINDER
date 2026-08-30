import mongoose from 'mongoose';

const evaluationResultSchema = new mongoose.Schema({
  dataset: { type: String, required: true },
  method: { type: String, enum: ['lexical', 'semantic', 'hybrid'], required: true },
  metrics: { recallAtK: Number, precisionAtK: Number, mrr: Number, ndcg: Number, groundedness: Number, citationCorrectness: Number, latencyMs: Number },
  sampleCount: { type: Number, min: 0, default: 0 },
  notes: String
}, { timestamps: true });

export default mongoose.model('EvaluationResult', evaluationResultSchema);
