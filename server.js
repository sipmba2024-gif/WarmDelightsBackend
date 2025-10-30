const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');
const trackAnalytics = require('./middleware/analytics');

const galleryRoutes = require('./routes/gallery');
const orderRoutes = require('./routes/orders');

const app = express();

// Add this to fix rate limit error (for proxies like Render/Heroku)
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Serve uploads dir as static files (NO custom CORS/header logic!)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helmet security + CSP (for API endpoints, not for static uploads)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https://warmdelightsbackend.onrender.com", "https://warmdelights11.netlify.app"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://warmdelightsbackend.onrender.com", "https://warmdelights11.netlify.app"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Updated CORS config to allow both localhost and Netlify/Render
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://warmdelights11.netlify.app',
  'https://warmdelightsbackend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed from this origin: ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Login-specific rate limiting - more restrictive
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting - less restrictive for other endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply login limiter to auth routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use(generalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add favicon.ico handler (no favicon, but no error)
app.get('/favicon.ico', (req, res) => res.status(204));

// Analytics middleware
app.use(trackAnalytics);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', require('./routes/customOrders'));
app.use('/api/gallery', galleryRoutes);
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/cart', require('./routes/cart'));

// Custom root endpoint for Render/health
app.get('/', (req, res) => {
  res.send("WarmDelights Backend is live!");
});

// Health check and test image endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});
app.get('/api/test-image', (req, res) => {
  res.json({
    message: 'Image test endpoint',
    imageUrl: '/uploads/example.jpg'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
