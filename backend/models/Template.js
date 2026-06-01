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
    enum: ['editing', 'poster', 'social-media', 'other'],
  },
  price: {
    type: Number,
    required: true,
    min: 0, // In smallest currency unit (e.g. Paise for INR, Cents for USD)
  },
  previewImagePath: {
    type: String,
    required: true, // Supabase public previews bucket file path
  },
  previewImageUrl: {
    type: String,
    required: true, // Publicly accessible URL for client display
  },
  fileStoragePath: {
    type: String,
    required: true, // Supabase private templates bucket path (never exposed directly)
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
