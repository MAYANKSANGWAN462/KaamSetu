// Purpose: Defines job posting schema with structured location, salary, and multi-worker assignment support.
const mongoose = require('mongoose');
const { SUBCATEGORY_VALUES } = require('../utils/categories');

const jobSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Keep legacy field for backward compatibility with old API consumers.
  hirerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: SUBCATEGORY_VALUES,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
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
  salary: {
    mode: {
      type: String,
      enum: ['fixed', 'range'],
      default: 'fixed'
    },
    fixed: {
      type: Number,
      min: 0
    },
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    recommended: {
      type: Number,
      min: 0
    }
  },
  // Keep legacy budget field to avoid breaking existing cards/services.
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  workersRequired: {
    type: Number,
    min: 1,
    default: 1
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  duration: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  assignedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  images: [{
    url: String,
    publicId: String
  }],
  startDate: Date,
  endDate: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Index for search
jobSchema.index({ category: 1, 'location.city': 1, status: 1 });
jobSchema.index({ 'location.coordinates': '2dsphere' });
jobSchema.index({ createdAt: -1 });

// Method to check if job is open
jobSchema.methods.isOpen = function() {
  return this.status === 'open';
};

// Method to assign one worker while supporting multi-worker jobs.
jobSchema.methods.assignWorker = async function(workerId) {
  if (!this.assignedWorkers.some((assignedId) => assignedId.toString() === workerId.toString())) {
    this.assignedWorkers.push(workerId);
  }
  if (this.assignedWorkers.length > 0) {
    this.status = 'in-progress';
  }
  await this.save();
};

module.exports = mongoose.model('Job', jobSchema);