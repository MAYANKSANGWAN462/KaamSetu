// Purpose: Tracks worker applications against jobs with status and ranking metadata.
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  bidAmount: {
    type: Number,
    min: 0
  },
  message: {
    type: String,
    maxlength: 500
  },
  skillMatchScore: {
    type: Number,
    default: 0
  },
  distanceKm: {
    type: Number,
    default: 0
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  viewedAt: Date,
  respondedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
applicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });
applicationSchema.index({ workerId: 1, status: 1 });

// Method to accept application
applicationSchema.methods.accept = async function() {
  this.status = 'accepted';
  this.respondedAt = Date.now();
  await this.save();
  
  // Update job with assigned worker
  const Job = mongoose.model('Job');
  await Job.findByIdAndUpdate(this.jobId, {
    assignedWorker: this.workerId,
    status: 'in-progress'
  });
};

// Method to reject application
applicationSchema.methods.reject = async function() {
  this.status = 'rejected';
  this.respondedAt = Date.now();
  await this.save();
};

module.exports = mongoose.model('Application', applicationSchema);