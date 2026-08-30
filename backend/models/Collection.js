import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FavoriteProject' }]
}, { timestamps: true });

collectionSchema.index({ userId: 1, name: 1 }, { unique: true });
export default mongoose.model('Collection', collectionSchema);
