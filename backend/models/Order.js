const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
  },
  customerEmail: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired'],
    default: 'pending',
  },
  signedDownloadUrl: {
    type: String,
  },
  urlExpiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
