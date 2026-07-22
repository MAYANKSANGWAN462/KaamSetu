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

const jobSchema = new mongoose.Schema(
  {
    hirerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'hirerId is required']
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true
    },
    wage: {
      type: wageSchema,
      default: () => ({ amount: 0, unit: 'daily' })
    },
    workersRequired: {
      type: Number,
      min: [1, 'workersRequired must be at least 1'],
      default: 1
    },
    duration: {
      type: String,
      trim: true,
      default: ''
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    location: {
      type: locationSchema,
      default: () => ({})
    },
    status: {
      type: String,
      enum: ['open', 'filled', 'cancelled'],
      default: 'open'
    },
    startDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({ hirerId: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1 });

module.exports = mongoose.model('Job', jobSchema);
