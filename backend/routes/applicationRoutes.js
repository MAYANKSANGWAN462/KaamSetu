const express = require('express');
const router = express.Router();
const {
  applyToJob,
  contactWorker,
  getMyApplications,
  getJobApplicants,
  checkInteraction,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, requireMode } = require('../middleware/authMiddleware');

// All application routes require authentication
router.use(protect);

// Worker routes
router.post('/',        requireMode('worker'), applyToJob);
router.get('/mine',     requireMode('worker'), getMyApplications);

// Hirer routes
router.post('/contact', requireMode('hirer'), contactWorker);
router.get('/job/:jobId', requireMode('hirer'), getJobApplicants);

// Shared — works for both modes
// checkInteraction used by frontend to decide whether to show Message button
router.get('/check', checkInteraction);

// Update status — hirer only
router.put('/:id', requireMode('hirer'), updateApplicationStatus);

module.exports = router;