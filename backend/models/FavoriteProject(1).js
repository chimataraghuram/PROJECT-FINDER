import mongoose from 'mongoose';

const favoriteProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  projectName: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  stars: {
    type: String
  },
  language: {
    type: String
  },
  description: {
    type: String
  },
  platform: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const FavoriteProject = mongoose.model('FavoriteProject', favoriteProjectSchema);
export default FavoriteProject;
