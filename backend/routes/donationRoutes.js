const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createDonationRequest,
  createFutureBooking,
  getNearbyRequests,
  acceptDonationRequest,
  rejectDonationRequest,
  completeDonationRequest,
  getDonorHistory,
  getOrphanageAlerts,
  getNotifications,
  markNotificationRead
} = require('../controllers/donationController');

// Donor specific paths
router.post('/create', protect, authorize('donor'), createDonationRequest);
router.post('/book-future', protect, authorize('donor'), createFutureBooking);
router.get('/history', protect, authorize('donor'), getDonorHistory);

// Orphanage specific paths
router.get('/nearby', protect, authorize('orphanage_head'), getNearbyRequests);
router.get('/alerts', protect, authorize('orphanage_head'), getOrphanageAlerts);
router.patch('/:id/accept', protect, authorize('orphanage_head'), acceptDonationRequest);
router.patch('/:id/reject', protect, authorize('orphanage_head'), rejectDonationRequest);
router.patch('/:id/complete', protect, completeDonationRequest); // Can be completed by donor or orphanage

// Notifications generic paths
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
