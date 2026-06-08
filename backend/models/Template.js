const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['alight-motion', 'kinemaster', 'capcut', 'lightroom', 'other'],
  },

  previewImagePath: {
    type: String,
    required: true, // Supabase public previews bucket file path
  },
  previewMediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  previewImageUrl: {
    type: String,
    required: true, // Publicly accessible URL for client display
  },
  fileStoragePath: {
    type: String,
    required: false,
  },
  templateUrl: {
    type: String,
    required: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Template', templateSchema);
