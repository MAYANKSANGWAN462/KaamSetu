const express = require('express');
const router = express.Router();
const {
  applyToJob,
  contactWorker,
  getMyApplications,
  getJobApplicants,
  checkInteraction,
  updateApplicationStatus,
  withdrawApplication
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

// Update status — hirer only (admin bypass handled in requireMode)
router.put('/:id', requireMode('hirer'), updateApplicationStatus);
// Alias — frontend jobService calls /:id/status for accept/reject
router.put('/:id/status', requireMode('hirer'), updateApplicationStatus);

// Worker withdraws their own pending or accepted application
router.patch('/:id/withdraw', requireMode('worker'), withdrawApplication);

module.exports = router;