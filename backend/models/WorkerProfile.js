const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const wageSchema = new mongoose.Schema(
  {
    amount: { type: Number, min: 0, default: 0 },
    unit: {
      type: String,
      enum: ['hourly', 'daily', 'job'],
      default: 'daily'
    }
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    avg: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    subCategory: {
      type: String,
      trim: true,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      trim: true,
      default: ''
    },
    wage: {
      type: wageSchema,
      default: () => ({ amount: 0, unit: 'daily' })
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    location: {
      type: locationSchema,
      default: () => ({})
    },
    portfolio: {
      type: [String],
      default: []
    },
    rating: {
      type: ratingSchema,
      default: () => ({ avg: 0, count: 0 })
    }
  },
  {
    timestamps: true
  }
);

workerProfileSchema.index({ userId: 1 });
workerProfileSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
