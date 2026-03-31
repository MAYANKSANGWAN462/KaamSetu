// Purpose: Stores worker profile capabilities used to infer worker role and matching.
const mongoose = require('mongoose');
const { SUBCATEGORY_VALUES } = require('../utils/categories');

const workerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  category: {
    type: String,
    enum: SUBCATEGORY_VALUES,
    required: true
  },
  customCategory: {
    type: String,
    trim: true,
    default: ''
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'tomorrow'],
    default: 'available'
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  portfolioImages: [{
    url: String,
    publicId: String
  }],
  portfolioVideos: [{
    url: String,
    publicId: String
  }],
  serviceAreas: [{
    type: String,
    required: true
  }],
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Punjabi', 'Tamil', 'Bengali', 'Other']
  }],
  idVerified: {
    type: Boolean,
    default: false
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for search optimization
workerProfileSchema.index({ category: 1, 'serviceAreas': 1 });
workerProfileSchema.index({ skills: 1 });
workerProfileSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);