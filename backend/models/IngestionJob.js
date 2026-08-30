import mongoose from 'mongoose';

const ingestionJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], required: true },
  result: mongoose.Schema.Types.Mixed,
  error: String,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('IngestionJob', ingestionJobSchema);
