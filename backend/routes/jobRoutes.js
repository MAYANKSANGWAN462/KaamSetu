const express = require('express');
const router = express.Router();
const { createJob, getJobs, getMyJobs, getJobById, updateJob, deleteJob, updateJobStatus } = require('../controllers/jobController');
const { protect, requireMode, optionalAuth } = require('../middleware/authMiddleware');

// ── Public routes ──────────────────────────────
// optionalAuth lets us hide the requester's own jobs + gate hirer contact info.
router.get('/', optionalAuth, getJobs);

// ── Static routes MUST come before /:id ────────
router.get('/mine',            protect, requireMode('hirer'), getMyJobs);
router.get('/my-jobs',         protect, requireMode('hirer'), getMyJobs); // alias
router.get('/applications/my', protect, requireMode('worker'), async (req, res) => {
  // Forward to application controller if exists, else return empty
  try {
    const Application = require('../models/Application');
    const apps = await Application.find({ workerId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, requireMode('hirer'), createJob);

router.patch('/:id/status', protect, requireMode('hirer'), updateJobStatus);

// ── Dynamic routes LAST ────────────────────────
router.get('/:id',    optionalAuth, getJobById);
router.put('/:id',    protect, requireMode('hirer'), updateJob);
router.delete('/:id', protect, requireMode('hirer'), deleteJob);

module.exports = router;