import mongoose from 'mongoose';

const embeddingMetadataSchema = new mongoose.Schema({
  chunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentChunk', required: true, unique: true },
  provider: { type: String, default: 'local-tfidf' },
  dimensions: { type: Number, required: true },
  vector: [{ type: Number }]
}, { timestamps: true });

export default mongoose.model('EmbeddingMetadata', embeddingMetadataSchema);
