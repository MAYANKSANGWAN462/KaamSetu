const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  adminLogin,
  getStats,
  listUsers,
  listWorkers,
  listJobs,
  listConversations,
  setUserStatus,
  deleteUser,
  moderateJob
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const isDev = process.env.NODE_ENV === 'development';

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// ── Public: separate admin login ──
router.post('/login', adminLoginLimiter, adminLogin);

// ── Everything below requires an authenticated admin ──
router.use(protect, authorize('admin'));

router.get('/stats',          getStats);
router.get('/users',          listUsers);
router.get('/workers',        listWorkers);
router.get('/jobs',           listJobs);
router.get('/conversations',  listConversations);

router.patch('/users/:id/status', setUserStatus);
router.delete('/users/:id',       deleteUser);
router.patch('/jobs/:id/status',  moderateJob);

module.exports = router;
