const express = require('express');
const {
  createCustomOrder,
  getCustomOrders,
  getCustomOrderById,
  updateCustomOrderStatus,
} = require('../controllers/customOrderController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', upload.single('referenceImage'), createCustomOrder);
router.get('/', auth, adminAuth, getCustomOrders);
router.get('/:id', auth, adminAuth, getCustomOrderById);
router.put('/:id/status', auth, adminAuth, updateCustomOrderStatus);

module.exports = router;