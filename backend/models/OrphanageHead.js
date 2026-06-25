const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const orphanageHeadSchema = new mongoose.Schema({
  headName: {
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
    default: 'orphanage_head'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false // Admin approves them
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

orphanageHeadSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

orphanageHeadSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('OrphanageHead', orphanageHeadSchema);
