const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Donor', 'OrphanageHead']
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info' // 'info', 'alert', 'success', 'warning'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
