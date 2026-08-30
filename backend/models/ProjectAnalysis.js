import mongoose from 'mongoose';

const projectAnalysisSchema = new mongoose.Schema({
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, unique: true },
  scores: { type: mongoose.Schema.Types.Mixed, default: {} },
  strengths: [String],
  limitations: [String],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('ProjectAnalysis', projectAnalysisSchema);
