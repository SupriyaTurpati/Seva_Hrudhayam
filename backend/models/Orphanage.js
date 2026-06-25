const mongoose = require('mongoose');

const orphanageSchema = new mongoose.Schema({
  orphanageName: {
    type: String,
    required: true,
    trim: true
  },
  headName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  boysCount: {
    type: Number,
    default: 0
  },
  girlsCount: {
    type: Number,
    default: 0
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  village: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  headId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrphanageHead',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Orphanage', orphanageSchema);
