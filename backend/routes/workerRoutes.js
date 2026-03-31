// Purpose: Defines worker profile APIs for discovery and profile management.
// Worker profile management routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getWorkers, 
  getWorkerById, 
  createWorkerProfile,
  getMyProfile,
  uploadPortfolio,
  deletePortfolioImage,
  updateAvailability
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getWorkers);

// Authenticated profile routes
router.get('/profile/me', protect, getMyProfile);
router.post('/profile', protect, createWorkerProfile);
router.put('/profile', protect, createWorkerProfile);
router.put('/availability', protect, updateAvailability);
router.post('/portfolio', protect, upload.array('images', 10), uploadPortfolio);
router.delete('/portfolio/:imageId', protect, deletePortfolioImage);

// Public dynamic route (declared last to avoid shadowing static routes)
router.get('/:id', getWorkerById);

module.exports = router;