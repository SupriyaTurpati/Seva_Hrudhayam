const jwt = require('jsonwebtoken');
const Donor = require('../models/Donor');
const OrphanageHead = require('../models/OrphanageHead');
const Orphanage = require('../models/Orphanage');
const Admin = require('../models/Admin');

const generateToken = (id, role, expiresIn) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'seva_hrudhayam_secret_key_12345', {
    expiresIn
  });
};

// @desc    Register a new donor
// @route   POST /api/auth/register-donor
// @access  Public
const registerDonor = async (req, res) => {
  try {
    const { name, phone, password, email, pincode, village, district, servingCount } = req.body;

    if (!name || !phone || !password || !email) {
      return res.status(400).json({ message: 'Please provide all required fields, including email' });
    }

    const donorExists = await Donor.findOne({ phone });
    if (donorExists) {
      return res.status(400).json({ message: 'Donor already exists with this phone number' });
    }

    const emailExists = await Donor.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Donor already exists with this email' });
    }

    const donor = await Donor.create({
      name,
      phone,
      password,
      email,
      pincode,
      village,
      district,
      servingCount: servingCount || 0
    });

    if (donor) {
      res.status(201).json({
        _id: donor._id,
        name: donor.name,
        phone: donor.phone,
        email: donor.email,
        role: donor.role,
        pincode: donor.pincode,
        village: donor.village,
        district: donor.district,
        servingCount: donor.servingCount,
        token: generateToken(donor._id, 'donor', '2h') // Temporary login (2 hours)
      });
    } else {
      res.status(400).json({ message: 'Invalid donor data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login donor
// @route   POST /api/auth/login-donor
// @access  Public
const loginDonor = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }

    const donor = await Donor.findOne({ phone });
    if (donor && (await donor.comparePassword(password))) {
      res.json({
        _id: donor._id,
        name: donor.name,
        phone: donor.phone,
        role: donor.role,
        pincode: donor.pincode,
        village: donor.village,
        district: donor.district,
        servingCount: donor.servingCount,
        token: generateToken(donor._id, 'donor', '2h')
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register an orphanage head & details
// @route   POST /api/auth/register-orphanage
// @access  Public
const registerOrphanage = async (req, res) => {
  try {
    const {
      headName,
      phone,
      password,
      orphanageName,
      email,
      boysCount,
      girlsCount,
      aadharNumber,
      district,
      village,
      pincode,
      latitude,
      longitude
    } = req.body;

    if (!headName || !phone || !password || !orphanageName || !email || !district || !village || !pincode || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const headExists = await OrphanageHead.findOne({ phone });
    if (headExists) {
      return res.status(400).json({ message: 'Orphanage head already exists with this phone number' });
    }

    const emailExists = await Orphanage.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Orphanage already exists with this email' });
    }

    // Create Head
    const head = await OrphanageHead.create({
      headName,
      phone,
      password,
      email,
      isVerified: false // Admin must approve
    });

    // Create Orphanage Details
    const orphanage = await Orphanage.create({
      orphanageName,
      headName,
      phone,
      email,
      boysCount: boysCount || 0,
      girlsCount: girlsCount || 0,
      district,
      village,
      pincode,
      latitude,
      longitude,
      headId: head._id
    });

    res.status(201).json({
      message: 'Registration submitted successfully. Awaiting Admin verification.',
      head: {
        _id: head._id,
        headName: head.headName,
        phone: head.phone,
        isVerified: head.isVerified,
        role: head.role
      },
      orphanage: orphanage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login orphanage
// @route   POST /api/auth/login-orphanage
// @access  Public
const loginOrphanage = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }

    const head = await OrphanageHead.findOne({ phone });
    if (head && (await head.comparePassword(password))) {
      const orphanage = await Orphanage.findOne({ headId: head._id });
      res.json({
        _id: head._id,
        headName: head.headName,
        phone: head.phone,
        isVerified: head.isVerified,
        role: head.role,
        orphanage,
        token: generateToken(head._id, 'orphanage_head', '30d') // Permanent session (30 days)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/auth/login-admin
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (admin && (await admin.comparePassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, 'admin', '1d')
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (current details and verification status)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    let profileData = {};
    if (req.user.role === 'admin') {
      profileData = req.user;
    } else if (req.user.role === 'donor') {
      profileData = req.user;
    } else if (req.user.role === 'orphanage_head') {
      const head = await OrphanageHead.findById(req.user._id).select('-password');
      if (!head) {
        return res.status(404).json({ message: 'User head account not found' });
      }
      const orphanage = await Orphanage.findOne({ headId: head._id });
      profileData = {
        _id: head._id,
        headName: head.headName,
        phone: head.phone,
        isVerified: head.isVerified,
        role: head.role,
        orphanage
      };
    }
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request Password Reset Link (Simulated SMTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const crypto = require('crypto');

    if (!email || !role) {
      return res.status(400).json({ message: 'Please provide email and role' });
    }

    let userModel;
    if (role === 'donor') {
      userModel = Donor;
    } else if (role === 'orphanage_head') {
      userModel = OrphanageHead;
    } else if (role === 'admin') {
      userModel = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User account not found with this email' });
    }

    // Generate crypto reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
    await user.save();

    // Reset Link
    const resetUrl = `http://localhost:5173/reset-password?token=${token}&role=${role}`;

    // Print to Console
    console.log('\n================== [SMTP MAIL SIMULATOR] ==================');
    console.log(`To: ${email}`);
    console.log('Subject: Seva Hrudhayam - Reset Password Link');
    console.log(`Click this link to update your password: \n${resetUrl}`);
    console.log('===========================================================\n');

    res.json({
      message: 'Password reset link sent to your email (simulated in backend console logs).',
      resetLink: resetUrl // Return in response for easier evaluation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Perform Password Update using Reset Token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, role, password } = req.body;

    if (!token || !role || !password) {
      return res.status(400).json({ message: 'Missing token, role, or password' });
    }

    let userModel;
    if (role === 'donor') {
      userModel = Donor;
    } else if (role === 'orphanage_head') {
      userModel = OrphanageHead;
    } else if (role === 'admin') {
      userModel = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Assign new password (automatically hashed by model save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset completed successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerDonor,
  loginDonor,
  registerOrphanage,
  loginOrphanage,
  loginAdmin,
  getUserProfile,
  forgotPassword,
  resetPassword
};
