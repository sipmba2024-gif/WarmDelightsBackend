const Analytics = require('../models/Analytics');

const trackAnalytics = async (req, res, next) => {
  try {
    // Skip analytics for certain routes
    if (req.path.includes('/api/analytics') || req.method === 'OPTIONS') {
      return next();
    }

    const eventData = {
      eventType: req.body.eventType || 'page_view',
      page: req.path,
      source: req.get('Referer') || 'direct',
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (req.user) {
      eventData.userId = req.user._id;
    }

    // Don't wait for analytics to complete
    Analytics.create(eventData).catch(err => {
      console.error('Analytics tracking error:', err);
    });

    next();
  } catch (error) {
    console.error('Analytics middleware error:', error);
    next();
  }
};

module.exports = trackAnalytics;
