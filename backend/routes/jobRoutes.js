// Purpose: Defines job API endpoints and applies authentication/authorization middleware.
const express = require('express');
const router = express.Router();
const { 
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
  getMyApplications,
  completeJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJobs);

// Hirer routes
router.post('/', protect, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.put('/:id/complete', protect, completeJob);
router.get('/:id/applications', protect, getJobApplications);
router.put('/:jobId/applications/:appId', protect, updateApplicationStatus);

// Worker routes
router.post('/:id/apply', protect, applyForJob);
router.get('/applications/my', protect, getMyApplications);

// Public dynamic route declared last to avoid shadowing static paths
router.get('/:id', getJobById);

module.exports = router;