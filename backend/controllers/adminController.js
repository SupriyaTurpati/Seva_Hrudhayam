const Donor = require('../models/Donor');
const Orphanage = require('../models/Orphanage');
const OrphanageHead = require('../models/OrphanageHead');
const DonationRequest = require('../models/DonationRequest');
const FutureBooking = require('../models/FutureBooking');
const DonationHistory = require('../models/DonationHistory');

// @desc    Get dashboard metrics & full lists
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    // 1. Core counters
    const totalDonors = await Donor.countDocuments();
    const totalOrphanages = await Orphanage.countDocuments();
    
    // Status counts for Instant requests
    const pendingInstant = await DonationRequest.countDocuments({ status: 'pending' });
    const acceptedInstant = await DonationRequest.countDocuments({ status: 'accepted' });
    const completedInstant = await DonationRequest.countDocuments({ status: 'completed' });

    // Status counts for Future bookings
    const pendingFuture = await FutureBooking.countDocuments({ status: 'pending' });
    const acceptedFuture = await FutureBooking.countDocuments({ status: 'accepted' });
    const completedFuture = await FutureBooking.countDocuments({ status: 'completed' });

    // Summing them up
    const pendingRequests = pendingInstant + pendingFuture;
    const acceptedRequests = acceptedInstant + acceptedFuture;
    const completedDeliveries = completedInstant + completedFuture;

    // 2. Fetch Detailed listings
    const donorsList = await Donor.find().select('-password').sort({ createdAt: -1 });
    const orphanagesList = await Orphanage.find().populate('headId', 'isVerified').sort({ createdAt: -1 });

    // Combine requests
    const instantList = await DonationRequest.find()
      .populate('donorId', 'name phone')
      .populate('acceptedBy', 'orphanageName phone')
      .sort({ createdAt: -1 });

    const futureList = await FutureBooking.find()
      .populate('donorId', 'name phone')
      .populate('acceptedBy', 'orphanageName phone')
      .sort({ createdAt: -1 });

    const allRequests = [
      ...instantList.map(item => ({ ...item.toObject(), type: 'instant' })),
      ...futureList.map(item => ({ ...item.toObject(), type: 'future' }))
    ];

    res.json({
      counters: {
        totalDonors,
        totalOrphanages,
        pendingRequests,
        acceptedRequests,
        completedDeliveries
      },
      donors: donorsList,
      orphanages: orphanagesList,
      requests: allRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Verify Orphanage Head registration
// @route   PATCH /api/admin/orphanages/:headId/verify
// @access  Private (Admin)
const toggleOrphanageVerification = async (req, res) => {
  try {
    const { headId } = req.params;
    const { isVerified } = req.body;

    if (isVerified === undefined) {
      return res.status(400).json({ message: 'isVerified field is required' });
    }

    const head = await OrphanageHead.findById(headId);
    if (!head) {
      return res.status(404).json({ message: 'Orphanage head not found' });
    }

    head.isVerified = isVerified;
    await head.save();

    res.json({
      message: `Orphanage registration status updated successfully to: ${isVerified ? 'Verified' : 'Unverified'}`,
      head: {
        _id: head._id,
        headName: head.headName,
        isVerified: head.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  toggleOrphanageVerification
};
