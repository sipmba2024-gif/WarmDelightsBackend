// server/models/Analytics.js - Enhanced version
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'api_call', 'login_attempt', 'registration_attempt',
      'order_created', 'custom_order_request', 'gallery_view', 'product_browse',
      'homepage_view', 'menu_view', 'about_view', 'contact_view', 'cart_view',
      'checkout_view', 'admin_access', 'add_to_cart', 'remove_from_cart',
      'search_products', 'unknown_event'
    ],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userRole: {
    type: String,
    enum: ['user', 'admin']
  },
  sessionId: {
    type: String,
    index: true
  },
  page: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  source: {
    type: String,
    default: 'direct'
  },
  userAgent: String,
  ip: String,
  metadata: {
    queryParams: mongoose.Schema.Types.Mixed,
    acceptLanguage: String,
    acceptEncoding: String,
    device: {
      isMobile: Boolean,
      isTablet: Boolean,
      isDesktop: Boolean,
      browser: String,
      os: String
    },
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  ecommerce: {
    action: {
      type: String,
      enum: ['purchase', 'add_to_cart', 'remove_from_cart', 'view_product']
    },
    value: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    productId: String,
    quantity: Number,
    items: [{
      productId: String,
      quantity: Number,
      price: Number
    }]
  },
  performance: {
    responseTime: Number,
    contentLength: Number,
    statusCode: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1, timestamp: -1 });
analyticsSchema.index({ 'ecommerce.action': 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
