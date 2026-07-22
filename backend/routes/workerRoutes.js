const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorkerProfile,
  getMyProfile,
  uploadPortfolio,
  deletePortfolioImage,
  updateAvailability
} = require('../controllers/workerController');
const { protect, requireMode, optionalAuth } = require('../middleware/authMiddleware');
const { uploadMultipleImages } = require('../middleware/uploadMiddleware');

// Public routes — declared before dynamic /:id.
// optionalAuth lets us hide the requester's own profile + gate contact info.
router.get('/', optionalAuth, getWorkers);
router.get('/profile/me', protect, getMyProfile);

// Worker-mode-only routes
router.post('/profile',      protect, requireMode('worker'), createWorkerProfile);
router.put('/profile',       protect, requireMode('worker'), createWorkerProfile);
router.patch('/availability',protect, requireMode('worker'), updateAvailability);
router.put('/availability',  protect, requireMode('worker'), updateAvailability);
router.post('/portfolio',    protect, requireMode('worker'), uploadMultipleImages, uploadPortfolio);
router.delete('/portfolio',  protect, requireMode('worker'), deletePortfolioImage);

// Dynamic public route — must be last
router.get('/:id', optionalAuth, getWorkerById);

module.exports = router;