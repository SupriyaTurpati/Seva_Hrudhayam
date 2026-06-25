const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAdminDashboard,
  toggleOrphanageVerification
} = require('../controllers/adminController');

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.patch('/orphanages/:headId/verify', protect, authorize('admin'), toggleOrphanageVerification);

module.exports = router;
