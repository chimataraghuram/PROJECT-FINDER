import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  score: { type: Number, min: 0, max: 100 },
  reasons: [String]
}, { timestamps: true });

recommendationSchema.index({ userId: 1, repositoryId: 1 }, { unique: true });
export default mongoose.model('Recommendation', recommendationSchema);
