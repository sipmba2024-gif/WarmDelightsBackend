const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrders,
  updateOrder,
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();
const orderController = require('../controllers/orderController');

// Get a single order
router.get('/:id', orderController.getOrderById);

// Update a single order
router.put('/:id', orderController.updateOrder); 

router.post('/', auth, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.get('/', auth, adminAuth, getOrders);
router.put('/:id/status', auth, adminAuth, updateOrder);

module.exports = router;