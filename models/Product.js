const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['cakes', 'cookies', 'cupcakes', 'muffins', 'breads', 'doughnuts', 'dry cakes'],
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  minQuantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unit: {
    type: String,
    required: true,
    enum: ['pc', 'box', 'kg'],
    default: 'pc',
  },
  description: {
    type: String,
    maxLength: 500,
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  allergens: [{
    type: String,
    enum: ['gluten', 'nuts', 'dairy', 'soy', 'eggs'],
  }],
  customizationOptions: {
    type: Map,
    of: [String],
  },
}, {
  timestamps: true,
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);