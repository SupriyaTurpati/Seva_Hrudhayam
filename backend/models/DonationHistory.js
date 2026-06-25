const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'donationModel'
  },
  donationModel: {
    type: String,
    required: true,
    enum: ['DonationRequest', 'FutureBooking']
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  orphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DonationHistory', donationHistorySchema);
