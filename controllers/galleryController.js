const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');

// Get all gallery images
const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload gallery image (admin only)
const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'warm-delights/gallery',
    });

    const galleryImage = new Gallery({
      title: req.body.title || 'Gallery Image',
      description: req.body.description || '',
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
    });

    const savedImage = await galleryImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete gallery image (admin only)
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (image) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(image.cloudinaryId);
      
      // Delete from database
      await Gallery.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update gallery image (admin only)
const updateGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (image) {
      image.title = req.body.title || image.title;
      image.description = req.body.description || image.description;
      image.isActive = req.body.isActive !== undefined ? req.body.isActive : image.isActive;

      const updatedImage = await image.save();
      res.json(updatedImage);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
};