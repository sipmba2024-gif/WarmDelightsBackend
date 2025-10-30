const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cakes', 'cookies', 'cupcakes', 'custom', 'events'],
    default: 'cakes'
  },
  imageUrl: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);