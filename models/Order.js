const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  customization: {
    type: Map,
    of: String,
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    //required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
  },
  contactNumber: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  deliveryInstructions: {
    type: String,
    maxLength: 500,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
}, {
  timestamps: true,
});

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `WD${Date.now()}${count.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);