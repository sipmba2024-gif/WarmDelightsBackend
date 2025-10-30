const express = require('express');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ uploadDate: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload new image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { title, description, category } = req.body;

    const newImage = new Gallery({
      title,
      description,
      category,
      imageUrl: '/uploads/' + req.file.filename,
      filename: req.file.filename,
      uploadDate: new Date()
    });

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the file from uploads directory
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', image.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update image
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const updatedImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      { title, description, category },
      { new: true }
    );
    res.json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;