import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  operation: { type: String, required: true },
  query: { type: String, maxlength: 1000 },
  latencyMs: Number,
  retrievalCount: Number,
  citations: [mongoose.Schema.Types.Mixed],
  feedback: { type: String, enum: ['up', 'down', null], default: null },
  error: String
}, { timestamps: true });

export default mongoose.model('AIInteraction', aiInteractionSchema);
