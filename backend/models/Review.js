const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'reviewerId is required']
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'revieweeId is required']
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ revieweeId: 1, createdAt: -1 });
// One review per (job, reviewer). Partial filter so direct reviews (jobId: null)
// are NOT constrained — otherwise a reviewer could leave only one direct review ever.
reviewSchema.index(
  { jobId: 1, reviewerId: 1 },
  { unique: true, partialFilterExpression: { jobId: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Review', reviewSchema);