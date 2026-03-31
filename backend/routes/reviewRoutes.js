const express = require('express');
const router = express.Router();
const { 
  createReview,
  getWorkerReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reportReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/worker/:workerId', getWorkerReviews);
router.get('/:id', getReviewById);

// Protected routes
router.use(protect);

// Hirer only routes
router.post('/', authorize('hirer'), createReview);
router.put('/:id', authorize('hirer'), updateReview);
router.delete('/:id', deleteReview); // Hirer or admin
router.post('/:id/report', reportReview);

module.exports = router;