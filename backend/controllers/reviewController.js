const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Create a review for a worker
// @route   POST /api/reviews
// @access  Private/Hirer
const createReview = async (req, res) => {
  try {
    const { jobId, workerId, rating, comment } = req.body;
    
    if (!jobId || !workerId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed jobs' });
    }
    
    // Check if user is the hirer of this job
    if (job.hirerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this job' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ jobId, workerId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this job' });
    }
    
    // Create review
    const review = await Review.create({
      jobId,
      workerId,
      hirerId: req.user._id,
      rating,
      comment
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ workerId: req.params.workerId })
      .populate('hirerId', 'name profileImage')
      .populate('jobId', 'title')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Review.countDocuments({ workerId: req.params.workerId });
    
    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(req.params.workerId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const averageRating = await Review.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(req.params.workerId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    res.json({
      reviews,
      ratingBreakdown,
      averageRating: averageRating[0]?.avg || 0,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get worker reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('hirerId', 'name profileImage')
      .populate('workerId', 'name profileImage')
      .populate('jobId', 'title');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Hirer
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.hirerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();
    
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Hirer or Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.hirerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await review.deleteOne();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report review (flag for admin)
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.isFlagged = true;
    review.flagReason = reason || 'No reason provided';
    await review.save();
    
    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getWorkerReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reportReview
};