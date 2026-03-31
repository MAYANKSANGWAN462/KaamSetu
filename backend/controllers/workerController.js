// Purpose: Manages worker profile CRUD, search, availability, and portfolio operations.
// Worker profile management and search controller
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { SUBCATEGORY_VALUES } = require('../utils/categories');

// @desc    Get all workers with filters and pagination
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
  try {
    const {
      category,
      location,
      minRating,
      maxRate,
      availability,
      page = 1,
      limit = 10,
      sort = 'rating'
    } = req.query;

    const query = {};

    if (category && category !== 'all' && category !== '') {
      query.category = category;
    }

    if (availability && availability !== 'all' && availability !== '') {
      query.availability = availability;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'rating':
        sortOptions = { 'userId.rating': -1 };
        break;
      case 'price_low':
        sortOptions = { dailyRate: 1 };
        break;
      case 'price_high':
        sortOptions = { dailyRate: -1 };
        break;
      case 'experience':
        sortOptions = { experience: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get worker profiles
    let workers = await WorkerProfile.find(query)
      .populate('userId', 'name email phone location rating totalReviews profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions)
      .lean();

    // Apply manual filters that can't be done in query
    let filteredWorkers = workers;

    if (location && location !== '') {
      filteredWorkers = filteredWorkers.filter(w =>
        w.serviceAreas?.some(area => area.toLowerCase().includes(location.toLowerCase()))
      );
    }

    if (maxRate && maxRate !== '') {
      filteredWorkers = filteredWorkers.filter(w => w.dailyRate <= parseFloat(maxRate));
    }

    if (minRating && minRating > 0) {
      filteredWorkers = filteredWorkers.filter(w =>
        w.userId?.rating >= parseFloat(minRating)
      );
    }

    // Filter out workers without userId (shouldn't happen but safety)
    filteredWorkers = filteredWorkers.filter(w => w.userId);

    const total = await WorkerProfile.countDocuments(query);

    res.json({
      success: true,
      data: {
        workers: filteredWorkers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
  try {
    const worker = await WorkerProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name email phone location rating totalReviews profileImage createdAt')
      .lean();

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Get reviews for this worker
    const reviews = await Review.find({ workerId: req.params.id })
      .populate('hirerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        ...worker,
        reviews,
        ratingBreakdown
      }
    });
  } catch (error) {
    console.error('Get worker by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update worker profile
// @route   POST /api/workers/profile
// @access  Private/Worker
const createWorkerProfile = async (req, res) => {
  try {
    const {
      skills,
      category,
      customCategory,
      experience,
      hourlyRate,
      dailyRate,
      description,
      serviceAreas,
      languages
    } = req.body;

    const latitude = req.body?.coordinates?.latitude ?? req.body?.latitude;
    const longitude = req.body?.coordinates?.longitude ?? req.body?.longitude;

    const normalizedCoordinates = {
      latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : undefined,
      longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : undefined
    };

    let profile = await WorkerProfile.findOne({ userId: req.user._id });

    if (profile) {
      profile.skills = skills || profile.skills;
      profile.category = category || profile.category;
      profile.customCategory = (category === 'Other' ? (customCategory || profile.customCategory || '') : '');
      profile.experience = experience || profile.experience;
      profile.hourlyRate = hourlyRate || profile.hourlyRate;
      profile.dailyRate = dailyRate || profile.dailyRate;
      profile.description = description || profile.description;
      profile.serviceAreas = serviceAreas || profile.serviceAreas;
      profile.languages = languages || profile.languages;
      if (normalizedCoordinates.latitude !== undefined && normalizedCoordinates.longitude !== undefined) {
        profile.coordinates = normalizedCoordinates;
      }

      await profile.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } else {
      profile = await WorkerProfile.create({
        userId: req.user._id,
        skills: skills || [],
        category: category || SUBCATEGORY_VALUES[0],
        customCategory: category === 'Other' ? (customCategory || '') : '',
        experience: experience || 0,
        hourlyRate: hourlyRate || 0,
        dailyRate: dailyRate || 0,
        description: description || '',
        serviceAreas: serviceAreas || [req.user.location || ''],
        languages: languages || [],
        coordinates: normalizedCoordinates
      });

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: profile
      });
    }
  } catch (error) {
    console.error('Create worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current worker's profile
// @route   GET /api/workers/profile/me
// @access  Private/Worker
const getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone location rating totalReviews profileImage')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete your profile.'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update availability
// @route   PUT /api/workers/availability
// @access  Private/Worker
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!['available', 'busy', 'tomorrow'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status'
      });
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability updated',
      data: { availability: profile.availability }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload portfolio images
// @route   POST /api/workers/portfolio
// @access  Private/Worker
const uploadPortfolio = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // For now, just return success without Cloudinary (placeholder)
    // When Cloudinary is configured, implement actual upload
    const uploadedImages = req.files.map((file, index) => ({
      url: `placeholder-url-${index}`,
      publicId: `placeholder-id-${index}`
    }));

    profile.portfolioImages.push(...uploadedImages);
    await profile.save();

    res.json({
      success: true,
      message: 'Portfolio uploaded successfully',
      data: { images: uploadedImages }
    });
  } catch (error) {
    console.error('Upload portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete portfolio image
// @route   DELETE /api/workers/portfolio/:imageId
// @access  Private/Worker
const deletePortfolioImage = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const image = profile.portfolioImages.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    image.deleteOne();
    await profile.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorkerProfile,
  getMyProfile,
  uploadPortfolio,
  deletePortfolioImage,
  updateAvailability
};