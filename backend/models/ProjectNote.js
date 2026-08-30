import mongoose from 'mongoose';

const projectNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoUrl: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true, maxlength: 10000 },
  tags: [{ type: String, trim: true, maxlength: 40 }]
}, { timestamps: true });

projectNoteSchema.index({ userId: 1, repoUrl: 1 });
export default mongoose.model('ProjectNote', projectNoteSchema);
