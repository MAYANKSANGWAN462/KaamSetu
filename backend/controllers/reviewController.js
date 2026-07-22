const mongoose = require('mongoose');
const Review = require('../models/Review');
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');

async function refreshWorkerRating(workerUserId) {
  const oid =
    typeof workerUserId === 'string'
      ? new mongoose.Types.ObjectId(workerUserId)
      : workerUserId;

  const agg = await Review.aggregate([
    { $match: { revieweeId: oid } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const row = agg[0];
  await WorkerProfile.updateOne(
    { userId: workerUserId },
    {
      $set: {
        'rating.avg': row ? Math.round(row.avg * 10) / 10 : 0,
        'rating.count': row ? row.count : 0
      }
    }
  );
}

/* ─── POST /api/reviews ───────────────────────────────────── */

const createReview = async (req, res) => {
  try {
    const { workerId, jobId, rating, comment } = req.body;

    if (!workerId || rating == null) {
      return res.status(400).json({
        success: false,
        message: 'workerId and rating are required'
      });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // If jobId provided, validate job ownership and completion
    if (jobId) {
      const job = await Job.findById(jobId).lean();
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      if (job.hirerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to review this job'
        });
      }
      if (job.status !== 'filled') {
        return res.status(400).json({
          success: false,
          message: 'Reviews are only allowed after the job is filled'
        });
      }

      const accepted = await Application.findOne({
        jobId,
        workerId,
        status: 'accepted'
      }).lean();
      if (!accepted) {
        return res.status(400).json({
          success: false,
          message: 'This worker was not accepted for the specified job'
        });
      }

      const existing = await Review.findOne({
        jobId,
        reviewerId: req.user._id
      }).lean();
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this job'
        });
      }
    } else {
      // Direct review without job — check interaction exists
      const interaction = await Application.findOne({
        workerId,
        hirerId: req.user._id
      }).lean();
      if (!interaction) {
        return res.status(403).json({
          success: false,
          message: 'You can only review workers you have interacted with'
        });
      }
    }

    const review = await Review.create({
      jobId: jobId || null,
      reviewerId: req.user._id,
      revieweeId: workerId,
      rating: ratingNum,
      comment: comment ? String(comment).trim().slice(0, 2000) : ''
    });

    await refreshWorkerRating(workerId);

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('[createReview]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this job'
      });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/reviews/worker/:workerId ──────────────────── */

const getWorkerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const workerOid = new mongoose.Types.ObjectId(req.params.workerId);

    const [reviews, total, stats] = await Promise.all([
      Review.find({ revieweeId: req.params.workerId })
        .populate('reviewerId', 'name profilePhoto')
        .populate('jobId', 'title')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Review.countDocuments({ revieweeId: req.params.workerId }),
      Review.aggregate([
        { $match: { revieweeId: workerOid } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
            avg: { $avg: '$rating' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const avgRating =
      stats.length > 0
        ? stats.reduce((sum, s) => sum + s.avg * s.count, 0) /
          stats.reduce((sum, s) => sum + s.count, 0)
        : 0;

    return res.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown: stats.map((s) => ({ rating: s._id, count: s.count })),
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('[getWorkerReviews]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PUT /api/reviews/:id ───────────────────────────────── */

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    if (req.body.rating != null) {
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        });
      }
      review.rating = rating;
    }
    if (req.body.comment !== undefined) {
      review.comment = String(req.body.comment).trim().slice(0, 2000);
    }

    await review.save();
    await refreshWorkerRating(review.revieweeId);

    return res.json({ success: true, data: review });
  } catch (error) {
    console.error('[updateReview]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── DELETE /api/reviews/:id ────────────────────────────── */

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (
      review.reviewerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const revieweeId = review.revieweeId;
    await review.deleteOne();
    await refreshWorkerRating(revieweeId);

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('[deleteReview]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getWorkerReviews,
  updateReview,
  deleteReview
};