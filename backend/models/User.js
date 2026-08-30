import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  username: { type: String, trim: true, maxlength: 80 },
  email: {
    type: String,
    required: true, unique: true, lowercase: true, trim: true
  },
  emailVerified: { type: Boolean, default: false },
  photoURL: { type: String, default: null },
  lastLoginAt: { type: Date, default: null }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
