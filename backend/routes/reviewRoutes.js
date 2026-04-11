const express = require('express');
const router = express.Router();
const {
  createReview,
  getWorkerReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, requireMode } = require('../middleware/authMiddleware');

// Public routes
router.get('/worker/:workerId', getWorkerReviews);

// Protected routes
router.post('/',    protect, requireMode('hirer'), createReview);
router.put('/:id',  protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;