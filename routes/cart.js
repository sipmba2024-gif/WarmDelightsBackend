const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    console.log("USER",req.user._id)
    // const cart = await Cart.findOne({ user: req.user._id }) 
    // const cart = await Cart.findOne ({ user: "68aeefbb427e69050fd4fc87" }) 
    // const cart = await Cart.find({ user: "68aeefbb427e69050fd4fc87" }) 
      // .populate('items.product', 'name image price category minQuantity unit');
    

      console.log(cart);

    if (!cart) {
      return res.json({
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        message: 'Product ID and positive quantity are required' 
      });
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate minimum quantities
    let minQuantity = product.minQuantity;
    if (product.category === 'cupcakes' || product.category === 'muffins') {
      minQuantity = 4;
    } else if (product.category === 'cookies' && product.unit === 'box') {
      minQuantity = 1;
    }

    if (quantity < minQuantity) {
      return res.status(400).json({ 
        message: `Minimum order for ${product.name} is ${minQuantity} ${product.unit}` 
      });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price
      });
    }

    await cart.save();
    
    // Populate and return updated cart
    const populatedCart = await cart.populate('items.product', 'name image price category minQuantity unit');
    res.json(populatedCart);

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// PUT /api/cart/update - Update cart item quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null || quantity < 0) {
      return res.status(400).json({ 
        message: 'Product ID and non-negative quantity are required' 
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate minimum quantities
      const product = await Product.findById(productId);
      let minQuantity = product.minQuantity;
      if (product.category === 'cupcakes' || product.category === 'muffins') {
        minQuantity = 4;
      } else if (product.category === 'cookies' && product.unit === 'box') {
        minQuantity = 1;
      }

      if (quantity < minQuantity) {
        return res.status(400).json({ 
          message: `Minimum order for ${product.name} is ${minQuantity} ${product.unit}` 
        });
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    // Populate and return updated cart
    const populatedCart = await cart.populate('items.product', 'name image price category minQuantity unit');
    res.json(populatedCart);

  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    
    // Populate and return updated cart
    const populatedCart = await cart.populate('items.product', 'name image price category minQuantity unit');
    res.json(populatedCart);

  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      items: [],
      totalAmount: 0,
      totalItems: 0
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router;
