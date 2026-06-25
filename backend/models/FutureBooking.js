const mongoose = require('mongoose');

const futureBookingSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  donationMode: {
    type: String,
    default: 'future'
  },
  itemType: {
    type: String,
    enum: ['Food', 'Clothes', 'Toys', 'Old Beds', 'Other'],
    required: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  servingCount: {
    type: Number,
    required: true,
    default: 0
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  pincode: {
    type: String,
    trim: true
  },
  village: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  extraNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'rejected'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FutureBooking', futureBookingSchema);
