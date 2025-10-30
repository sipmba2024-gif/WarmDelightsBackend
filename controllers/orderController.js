const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryAddress,
      contactNumber,
      deliveryDate,
      deliveryInstructions,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = req.body;

    // Verify products and calculate total
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      // Validate minimum quantities
      if (product.category === 'cupcakes' || product.category === 'muffins') {
        if (item.quantity < 4) {
          return res.status(400).json({
            message: `Minimum order for ${product.name} is 4 pieces`
          });
        }
      } else if (product.category === 'cookies' && product.unit === 'box') {
        if (item.quantity < 1) {
          return res.status(400).json({
            message: `Minimum order for ${product.name} is 1 box (250g)`
          });
        }
      } else if (item.quantity < product.minQuantity) {
        return res.status(400).json({
          message: `Minimum order for ${product.name} is ${product.minQuantity} ${product.unit}`
        });
      }

      calculatedTotal += product.price * item.quantity;
    }

    // Validate total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ message: 'Total amount mismatch' });
    }

    const order = new Order({
      customer: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      contactNumber,
      deliveryDate,
      deliveryInstructions,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    const createdOrder = await order.save();

    // Send confirmation email
    try {
      await sendOrderConfirmation(createdOrder, {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price');

    if (order) {
      // Check if user owns the order or is admin
      if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin only)
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .populate('customer', 'name email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

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

// Update order (status, paymentStatus, deliveryInstructions)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (req.body.status) order.status = req.body.status;
      if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
      if (req.body.deliveryInstructions) order.deliveryInstructions = req.body.deliveryInstructions;
      // Optionally, update more fields as needed

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrders,
  updateOrder, 
};
