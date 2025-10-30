const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product && product.isActive) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (admin only)
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      minQuantity: req.body.minQuantity,
      unit: req.body.unit,
      description: req.body.description,
      image: req.body.image,
      allergens: req.body.allergens,
      customizationOptions: req.body.customizationOptions,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.price = req.body.price || product.price;
      product.minQuantity = req.body.minQuantity || product.minQuantity;
      product.unit = req.body.unit || product.unit;
      product.description = req.body.description || product.description;
      product.image = req.body.image || product.image;
      product.allergens = req.body.allergens || product.allergens;
      product.customizationOptions = req.body.customizationOptions || product.customizationOptions;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.isActive = false;
      await product.save();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};