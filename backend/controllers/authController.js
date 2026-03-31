// Purpose: Handles authentication flows and authenticated user profile operations.
// Authentication controller for user registration, login, and profile management
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

const buildAuthUserPayload = async (user) => {
  const workerProfile = await WorkerProfile.findOne({ userId: user._id }).lean();
  const actsAsWorker = Boolean(workerProfile);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    preferredMode: user.preferredMode,
    location: user.location,
    address: user.address,
    bio: user.bio,
    profileImage: user.profileImage,
    language: user.language,
    actsAsWorker,
    actsAsHirer: true,
    workerProfile
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('[AUTH][REGISTER] Incoming request', {
      email: req.body?.email,
      phone: req.body?.phone
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, location, language } = req.body;

    const duplicateQuery = [{ email }];
    if (phone) {
      duplicateQuery.push({ phone });
    }

    const userExists = await User.findOne({ $or: duplicateQuery });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'user',
      location: location || '',
      language: language || 'en'
    });

    const userPayload = await buildAuthUserPayload(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      data: userPayload
    });
    console.log('[AUTH][REGISTER] Success', { userId: user._id.toString() });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('[AUTH][LOGIN] Incoming request', { email: req.body?.email });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact admin.'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = Date.now();
    await user.save();

    const userPayload = await buildAuthUserPayload(user);

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      data: userPayload
    });
    console.log('[AUTH][LOGIN] Success', { userId: user._id.toString() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Google Login / Register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from Google'
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: googleId + Date.now(), // Random password since Google auth
        role: 'user',
        location: '',
        profileImage: picture || '',
        isVerified: true
      });
    }

    user.lastLogin = Date.now();
    await user.save();

    const userPayload = await buildAuthUserPayload(user);

    res.json({
      success: true,
      message: 'Google login successful',
      token: generateToken(user._id),
      data: userPayload
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const workerProfile = await WorkerProfile.findOne({ userId: user._id }).lean();

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        actsAsWorker: Boolean(workerProfile),
        actsAsHirer: true,
        workerProfile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.address = req.body.address ?? user.address;
    user.bio = req.body.bio ?? user.bio;
    user.language = req.body.language || user.language;

    if (req.body.preferredMode && ['worker', 'hirer'].includes(req.body.preferredMode)) {
      user.preferredMode = req.body.preferredMode;
      user.role = req.body.preferredMode;
    }

    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        preferredMode: updatedUser.preferredMode,
        location: updatedUser.location,
        address: updatedUser.address,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        token: generateToken(updatedUser._id)
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  changePassword
};