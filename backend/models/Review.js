const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  hirerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
});

// Index for unique review per job
reviewSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

// After saving, update worker's rating
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  const worker = await User.findById(this.workerId);
  
  // Get all reviews for this worker
  const reviews = await Review.find({ workerId: this.workerId });
  const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  worker.rating = averageRating;
  worker.totalReviews = reviews.length;
  await worker.save();
});

// After delete, update worker's rating
reviewSchema.post('remove', async function() {
  const User = mongoose.model('User');
  const reviews = await Review.find({ workerId: this.workerId });
  
  if (reviews.length === 0) {
    await User.findByIdAndUpdate(this.workerId, { rating: 0, totalReviews: 0 });
  } else {
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRating / reviews.length;
    await User.findByIdAndUpdate(this.workerId, {
      rating: averageRating,
      totalReviews: reviews.length
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;