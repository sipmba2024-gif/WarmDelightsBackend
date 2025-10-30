const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/users', auth, adminAuth, getUsers);

module.exports = router;