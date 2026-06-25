const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerDonor,
  loginDonor,
  registerOrphanage,
  loginOrphanage,
  loginAdmin,
  getUserProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/register-donor', registerDonor);
router.post('/login-donor', loginDonor);
router.post('/register-orphanage', registerOrphanage);
router.post('/login-orphanage', loginOrphanage);
router.post('/login-admin', loginAdmin);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
