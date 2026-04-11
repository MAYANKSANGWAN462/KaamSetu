const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'workerId is required']
    },
    hirerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'hirerId is required']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index(
  { jobId: 1, workerId: 1 },
  {
    unique: true,
    partialFilterExpression: { jobId: { $exists: true, $ne: null } }
  }
);
applicationSchema.index({ hirerId: 1, workerId: 1 });
applicationSchema.index({ workerId: 1, status: 1 });
applicationSchema.index({ hirerId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
