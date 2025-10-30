const Analytics = require('../models/Analytics');
const Order = require('../models/Order');

// Track analytics event
const trackEvent = async (req, res) => {
  try {
    const { eventType, page, metadata } = req.body;
    
    const eventData = {
      eventType,
      page: page || req.path,
      source: req.get('Referer') || 'direct',
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      metadata
    };

    if (req.user) {
      eventData.userId = req.user._id;
    }

    const analyticsEntry = new Analytics(eventData);
    await analyticsEntry.save();
    
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ message: 'Failed to track event' });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get total visitors
    const totalVisitors = await Analytics.countDocuments({
      ...dateFilter,
      eventType: 'page_view',
    });

    // Get total orders
    const totalOrders = await Order.countDocuments(dateFilter);

    // Get total revenue
    const revenueData = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get conversion rate
    const pageViews = await Analytics.countDocuments({
      ...dateFilter,
      eventType: 'page_view',
      page: '/menu',
    });
    const conversionRate = pageViews > 0 ? (totalOrders / pageViews) : 0;

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$product.name', 'Unknown Product'] },
          quantity: '$totalQuantity',
          revenue: '$totalRevenue',
          orders: '$orderCount',
        },
      },
    ]);

    // Get traffic sources
    const trafficSources = await Analytics.aggregate([
      { $match: { ...dateFilter, eventType: 'page_view' } },
      {
        $group: {
          _id: '$source',
          visitors: { $sum: 1 },
        },
      },
      {
        $project: {
          source: '$_id',
          visitors: 1,
          conversionRate: 1, // Will be calculated separately if needed
        },
      },
    ]);

    res.json({
      totalVisitors,
      totalOrders,
      totalRevenue,
      conversionRate,
      topProducts,
      trafficSources,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const activities = await Analytics.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// In analyticsController.js
const getWhatsAppOrdersCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const count = await Analytics.countDocuments({
      ...dateFilter,
      eventType: 'whatsapp_order',
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackEvent,
  getAnalytics,
  getRecentActivity,
  getWhatsAppOrdersCount,
};
