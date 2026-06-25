const DonationRequest = require('../models/DonationRequest');
const FutureBooking = require('../models/FutureBooking');
const Orphanage = require('../models/Orphanage');
const OrphanageHead = require('../models/OrphanageHead');
const Notification = require('../models/Notification');
const DonationHistory = require('../models/DonationHistory');
const { getIO } = require('../utils/socket');

// Haversine Distance Formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// @desc    Create Instant Donation Request
// @route   POST /api/donations/create
// @access  Private (Donor)
const createDonationRequest = async (req, res) => {
  try {
    const { itemType, itemDescription, quantity, servingCount, latitude, longitude, pincode, village, district } = req.body;

    if (!itemType || !quantity || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const request = await DonationRequest.create({
      donorId: req.user._id,
      itemType,
      itemDescription,
      quantity,
      servingCount: servingCount || 0,
      latitude,
      longitude,
      pincode,
      village,
      district,
      status: 'pending'
    });

    // Match and Notify Orphanages
    // 1. Get all verified orphanage heads
    const verifiedHeads = await OrphanageHead.find({ isVerified: true });
    const verifiedHeadIds = verifiedHeads.map(h => h._id);

    // 2. Get active orphanages belonging to verified heads
    const orphanages = await Orphanage.find({ headId: { $in: verifiedHeadIds } });

    let matchingOrphanages = [];
    let districtFallbackOrphanages = [];

    for (const orphanage of orphanages) {
      const dist = getDistance(latitude, longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20) {
        matchingOrphanages.push({ orphanage, distance: dist });
      } else if (district && orphanage.district && orphanage.district.toLowerCase() === district.toLowerCase()) {
        districtFallbackOrphanages.push({ orphanage, distance: dist });
      }
    }

    // Sort by distance
    matchingOrphanages.sort((a, b) => a.distance - b.distance);
    districtFallbackOrphanages.sort((a, b) => a.distance - b.distance);

    // If no orphanage in 20km, fallback to district match
    const finalMatches = matchingOrphanages.length > 0 ? matchingOrphanages : districtFallbackOrphanages;

    // Send notifications to matches
    const io = getIO();
    for (const match of finalMatches) {
      const targetHeadId = match.orphanage.headId.toString();
      
      // Create DB notification
      await Notification.create({
        userId: targetHeadId,
        userModel: 'OrphanageHead',
        message: `New donation alert: ${quantity} of ${itemType} available within ${match.distance.toFixed(1)} km!`,
        type: 'alert'
      });

      // Emit WebSocket event
      io.to(`orphanage_head_${targetHeadId}`).emit('new_alert', {
        donationId: request._id,
        itemType,
        quantity,
        distance: match.distance,
        message: `New donation alert: ${quantity} of ${itemType} available nearby!`
      });
    }

    res.status(201).json({
      message: 'Donation request created successfully. Nearby orphanages have been alerted.',
      request,
      matches: finalMatches.map(m => ({
        id: m.orphanage._id,
        name: m.orphanage.orphanageName,
        phone: m.orphanage.phone,
        distance: m.distance
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Future Booking
// @route   POST /api/donations/book-future
// @access  Private (Donor)
const createFutureBooking = async (req, res) => {
  try {
    const { bookingDate, itemType, quantity, servingCount, latitude, longitude, pincode, village, district, extraNotes } = req.body;

    if (!bookingDate || !itemType || !quantity || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const booking = await FutureBooking.create({
      donorId: req.user._id,
      bookingDate,
      itemType,
      quantity,
      servingCount: servingCount || 0,
      latitude,
      longitude,
      pincode,
      village,
      district,
      extraNotes,
      status: 'pending'
    });

    // Notify orphanages similarly
    const verifiedHeads = await OrphanageHead.find({ isVerified: true });
    const verifiedHeadIds = verifiedHeads.map(h => h._id);
    const orphanages = await Orphanage.find({ headId: { $in: verifiedHeadIds } });

    let finalMatches = [];
    for (const orphanage of orphanages) {
      const dist = getDistance(latitude, longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20) {
        finalMatches.push({ orphanage, distance: dist });
      } else if (district && orphanage.district && orphanage.district.toLowerCase() === district.toLowerCase()) {
        finalMatches.push({ orphanage, distance: dist });
      }
    }
    finalMatches.sort((a, b) => a.distance - b.distance);

    const io = getIO();
    const formattedDate = new Date(bookingDate).toLocaleDateString();
    for (const match of finalMatches) {
      const targetHeadId = match.orphanage.headId.toString();

      await Notification.create({
        userId: targetHeadId,
        userModel: 'OrphanageHead',
        message: `New future booking: ${quantity} of ${itemType} scheduled for ${formattedDate} (${match.distance.toFixed(1)} km away).`,
        type: 'info'
      });

      io.to(`orphanage_head_${targetHeadId}`).emit('new_alert', {
        donationId: booking._id,
        itemType,
        quantity,
        distance: match.distance,
        bookingDate,
        message: `New future booking scheduled for ${formattedDate}!`
      });
    }

    res.status(201).json({
      message: 'Future booking created successfully.',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby donation alerts for current orphanage
// @route   GET /api/donations/nearby
// @access  Private (Orphanage Head)
const getNearbyRequests = async (req, res) => {
  try {
    const orphanage = await Orphanage.findOne({ headId: req.user._id });
    if (!orphanage) {
      return res.status(404).json({ message: 'Orphanage profile not found' });
    }

    // Fetch all pending requests and future bookings
    const pendingRequests = await DonationRequest.find({ status: 'pending' }).populate('donorId', 'name phone');
    const pendingBookings = await FutureBooking.find({ status: 'pending' }).populate('donorId', 'name phone');

    let matchedAlerts = [];

    // Process instant requests
    for (const reqObj of pendingRequests) {
      const dist = getDistance(reqObj.latitude, reqObj.longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20) {
        matchedAlerts.push({ ...reqObj.toObject(), distance: dist, type: 'instant' });
      } else if (reqObj.district && orphanage.district && reqObj.district.toLowerCase() === orphanage.district.toLowerCase()) {
        matchedAlerts.push({ ...reqObj.toObject(), distance: dist, type: 'instant' });
      }
    }

    // Process future bookings
    for (const bookObj of pendingBookings) {
      const dist = getDistance(bookObj.latitude, bookObj.longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20) {
        matchedAlerts.push({ ...bookObj.toObject(), distance: dist, type: 'future' });
      } else if (bookObj.district && orphanage.district && bookObj.district.toLowerCase() === orphanage.district.toLowerCase()) {
        matchedAlerts.push({ ...bookObj.toObject(), distance: dist, type: 'future' });
      }
    }

    // Sort by distance
    matchedAlerts.sort((a, b) => a.distance - b.distance);

    res.json(matchedAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept donation request
// @route   PATCH /api/donations/:id/accept
// @access  Private (Orphanage Head)
const acceptDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'instant' or 'future'

    const orphanage = await Orphanage.findOne({ headId: req.user._id });
    if (!orphanage) {
      return res.status(404).json({ message: 'Orphanage profile not found' });
    }

    let donation;
    if (type === 'future') {
      donation = await FutureBooking.findById(id).populate('donorId');
    } else {
      donation = await DonationRequest.findById(id).populate('donorId');
    }

    if (!donation) {
      return res.status(404).json({ message: 'Donation request not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Request is already processed' });
    }

    donation.status = 'accepted';
    donation.acceptedBy = orphanage._id;
    await donation.save();

    // Create Notification for Donor
    await Notification.create({
      userId: donation.donorId._id,
      userModel: 'Donor',
      message: `Your donation request has been accepted by ${orphanage.orphanageName}. You can contact them at ${orphanage.phone}.`,
      type: 'success'
    });

    // Notify Donor in real-time
    const io = getIO();
    io.to(`donor_${donation.donorId._id}`).emit('donation_accepted', {
      donationId: id,
      orphanageName: orphanage.orphanageName,
      phone: orphanage.phone
    });

    res.json({ message: 'Request accepted successfully', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject / Hide donation request
// @route   PATCH /api/donations/:id/reject
// @access  Private (Orphanage Head)
const rejectDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    let donation;
    if (type === 'future') {
      donation = await FutureBooking.findById(id);
    } else {
      donation = await DonationRequest.findById(id);
    }

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Set to rejected
    donation.status = 'rejected';
    await donation.save();

    res.json({ message: 'Request rejected', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete donation request
// @route   PATCH /api/donations/:id/complete
// @access  Private (Orphanage Head / Donor)
const completeDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'instant' or 'future'

    let donation;
    if (type === 'future') {
      donation = await FutureBooking.findById(id).populate('donorId');
    } else {
      donation = await DonationRequest.findById(id).populate('donorId');
    }

    if (!donation) {
      return res.status(404).json({ message: 'Donation request not found' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Donation must be accepted first before completing' });
    }

    donation.status = 'completed';
    await donation.save();

    // Record in History
    await DonationHistory.create({
      donationId: donation._id,
      donationModel: type === 'future' ? 'FutureBooking' : 'DonationRequest',
      donorId: donation.donorId._id,
      orphanageId: donation.acceptedBy,
      status: 'completed'
    });

    // Notify Donor
    await Notification.create({
      userId: donation.donorId._id,
      userModel: 'Donor',
      message: `Donation of ${donation.quantity} ${donation.itemType} completed. Thank you for your support!`,
      type: 'success'
    });

    const io = getIO();
    io.to(`donor_${donation.donorId._id}`).emit('donation_completed', {
      donationId: id
    });

    res.json({ message: 'Donation marked as completed successfully', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor donation history
// @route   GET /api/donor/history
// @access  Private (Donor)
const getDonorHistory = async (req, res) => {
  try {
    const instantRequests = await DonationRequest.find({ donorId: req.user._id })
      .populate('acceptedBy', 'orphanageName phone')
      .sort({ createdAt: -1 });

    const futureBookings = await FutureBooking.find({ donorId: req.user._id })
      .populate('acceptedBy', 'orphanageName phone')
      .sort({ createdAt: -1 });

    res.json({
      instant: instantRequests,
      future: futureBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orphanage alerts dashboard overview
// @route   GET /api/orphanage/alerts
// @access  Private (Orphanage Head)
const getOrphanageAlerts = async (req, res) => {
  try {
    const orphanage = await Orphanage.findOne({ headId: req.user._id });
    if (!orphanage) {
      return res.status(404).json({ message: 'Orphanage profile not found' });
    }

    // Get alerts matching (pending status)
    const pendingReqs = await DonationRequest.find({ status: 'pending' }).populate('donorId', 'name phone');
    const pendingBooks = await FutureBooking.find({ status: 'pending' }).populate('donorId', 'name phone');

    let nearbyAlerts = [];
    
    for (const reqObj of pendingReqs) {
      const dist = getDistance(reqObj.latitude, reqObj.longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20 || (reqObj.district && orphanage.district && reqObj.district.toLowerCase() === orphanage.district.toLowerCase())) {
        nearbyAlerts.push({ ...reqObj.toObject(), distance: dist, type: 'instant' });
      }
    }

    for (const bookObj of pendingBooks) {
      const dist = getDistance(bookObj.latitude, bookObj.longitude, orphanage.latitude, orphanage.longitude);
      if (dist <= 20 || (bookObj.district && orphanage.district && bookObj.district.toLowerCase() === orphanage.district.toLowerCase())) {
        nearbyAlerts.push({ ...bookObj.toObject(), distance: dist, type: 'future' });
      }
    }

    nearbyAlerts.sort((a, b) => a.distance - b.distance);

    // Get accepted active requests for this orphanage
    const activeReqs = await DonationRequest.find({ acceptedBy: orphanage._id, status: 'accepted' })
      .populate('donorId', 'name phone')
      .sort({ updatedAt: -1 });

    const activeBooks = await FutureBooking.find({ acceptedBy: orphanage._id, status: 'accepted' })
      .populate('donorId', 'name phone')
      .sort({ updatedAt: -1 });

    // Combine active
    const activeDonations = [
      ...activeReqs.map(r => ({ ...r.toObject(), type: 'instant', distance: getDistance(r.latitude, r.longitude, orphanage.latitude, orphanage.longitude) })),
      ...activeBooks.map(b => ({ ...b.toObject(), type: 'future', distance: getDistance(b.latitude, b.longitude, orphanage.latitude, orphanage.longitude) }))
    ];

    // Get completed donation history
    const history = await DonationHistory.find({ orphanageId: orphanage._id })
      .populate('donorId', 'name phone')
      .sort({ completedAt: -1 });

    res.json({
      nearby: nearbyAlerts,
      active: activeDonations,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's notifications
// @route   GET /api/donations/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/donations/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
