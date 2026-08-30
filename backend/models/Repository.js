import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  provider: { type: String, enum: ['github'], default: 'github' },
  owner: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
  signals: { type: mongoose.Schema.Types.Mixed, default: {} },
  ingestion: {
    status: { type: String, enum: ['discovered', 'processing', 'ready', 'failed'], default: 'discovered' },
    error: { type: String, default: null },
    completedAt: { type: Date, default: null }
  }
}, { timestamps: true });

repositorySchema.index({ provider: 1, owner: 1, name: 1 }, { unique: true });
export default mongoose.model('Repository', repositorySchema);
