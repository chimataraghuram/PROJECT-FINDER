import mongoose from 'mongoose';

const searchQuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  query: { type: String, required: true, trim: true, maxlength: 500 },
  platform: { type: String, default: 'GitHub', maxlength: 40 },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  resultCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model('SearchQuery', searchQuerySchema);
