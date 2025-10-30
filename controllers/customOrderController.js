const CustomOrder = require('../models/CustomOrder');
const { sendCustomOrderConfirmation } = require('../utils/emailService');

// Create custom order request
const createCustomOrder = async (req, res) => {
  try {
    console.log('Custom order request body:', req.body);
    console.log('Custom order request file:', req.file);
    
    const {
      name,
      email,
      phone,
      size,
      flavor,
      designNotes,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        message: 'Name, email, and phone are required fields' 
      });
    }

    let referenceImage = null;
    if (req.file) {
      referenceImage = req.file.path;
    }

    const customOrder = new CustomOrder({
      name,
      email,
      phone,
      size: size || '',
      flavor: flavor || '',
      designNotes: designNotes || '',
      referenceImage,
    });

    const createdOrder = await customOrder.save();
    
    // Send confirmation email (optional - don't let it break the flow)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await sendCustomOrderConfirmation(createdOrder);

        console.log("Custom ORDER")
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw error - email is optional
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Custom order creation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create custom order' 
    });
  }
};

// Get all custom orders (admin only)
const getCustomOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await CustomOrder.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CustomOrder.countDocuments();

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get custom order by ID (admin only)
const getCustomOrderById = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Custom order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update custom order status (admin only)
const updateCustomOrderStatus = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      order.adminNotes = req.body.adminNotes || order.adminNotes;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Custom order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCustomOrder,
  getCustomOrders,
  getCustomOrderById,
  updateCustomOrderStatus,
};