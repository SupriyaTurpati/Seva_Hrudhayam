const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'donor'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
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
  servingCount: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

donorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

donorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Donor', donorSchema);
