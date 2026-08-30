import mongoose from 'mongoose';

const researchSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, maxlength: 160 },
  messages: [{ role: { type: String, enum: ['user', 'assistant'] }, content: String, citations: [mongoose.Schema.Types.Mixed], latencyMs: Number }]
}, { timestamps: true });

export default mongoose.model('ResearchSession', researchSessionSchema);
