const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  flavor: {
    type: String,
    trim: true,
  },
  designNotes: {
    type: String,
    maxLength: 1000,
  },
  referenceImage: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    maxLength: 1000,
  },
  quoteAmount: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);