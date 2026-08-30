import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  sourceType: { type: String, enum: ['readme', 'metadata', 'tree', 'release'], required: true },
  filePath: { type: String, default: null },
  section: { type: String, default: null },
  content: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

documentChunkSchema.index({ repositoryId: 1, sourceType: 1 });
documentChunkSchema.index({ content: 'text' });
export default mongoose.model('DocumentChunk', documentChunkSchema);
