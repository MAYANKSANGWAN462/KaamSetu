const mongoose = require('mongoose');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const { signToken } = require('../utils/generateToken');
const { sanitizeUserDoc } = require('../utils/sanitizeUser');
const { safeRegex } = require('../utils/helpers');

/* ─── POST /api/admin/login ──────────────────────────────────
 * Separate admin entry point. Only accounts with role 'admin' may log in here.
 */
const adminLogin = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    // Uniform message — do not reveal whether the email exists or the role.
    const denied = () =>
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    if (!user || user.role !== 'admin') return denied();
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Admin account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return denied();

    user.lastLogin = new Date();
    await user.save();

    // Bearer-only token — deliberately NOT set as the shared cookie so an admin
    // session never collides with a marketplace session in the same browser.
    const token = signToken(user._id);
    return res.json({
      success: true,
      message: 'Admin login successful',
      token,
      data: sanitizeUserDoc(user)
    });
  } catch (error) {
    console.error('[adminLogin]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/admin/stats ──────────────────────────────────
 * Dashboard overview + analytics + system health.
 */
const getStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalWorkersMode,
      totalHirersMode,
      activeUsers,
      admins,
      totalJobs,
      openJobs,
      filledJobs,
      totalWorkerPosts,
      recentRegistrations,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ activeMode: 'worker' }),
      User.countDocuments({ activeMode: 'hirer' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'filled' }),
      WorkerProfile.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.find().select('name email createdAt activeMode').sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const health = {
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptimeSeconds: Math.round(process.uptime()),
      nodeEnv: process.env.NODE_ENV || 'development'
    };

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalWorkers: totalWorkersMode,
        totalHirers: totalHirersMode,
        activeUsers,
        admins,
        totalJobs,
        activeJobs: openJobs,
        filledJobs,
        totalWorkerPosts,
        recentRegistrations,
        recentUsers,
        health
      }
    });
  } catch (error) {
    console.error('[getStats]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/admin/users ──────────────────────────────────
 * Optional filters: role, mode (worker|hirer), status (active|suspended), q (name/email).
 */
const listUsers = async (req, res) => {
  try {
    const { role, mode, status, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

    const query = {};
    if (role && ['user', 'admin'].includes(role)) query.role = role;
    if (mode && ['worker', 'hirer'].includes(mode)) query.activeMode = mode;
    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    if (q && String(q).trim()) {
      const re = new RegExp(safeRegex(String(q)), 'i');
      query.$or = [{ name: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[listUsers]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/admin/workers ────────────────────────────────── */
const listWorkers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

    const [workers, total] = await Promise.all([
      WorkerProfile.find({})
        .populate('userId', 'name email phone isActive createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WorkerProfile.countDocuments()
    ]);

    return res.json({
      success: true,
      data: workers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[listWorkers]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/admin/jobs ───────────────────────────────────── */
const listJobs = async (req, res) => {
  try {
    const { status, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (q && String(q).trim()) query.title = new RegExp(safeRegex(String(q)), 'i');

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('hirerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[listJobs]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/admin/conversations ──────────────────────────
 * Metadata only — participant ids, message count, last activity. No content.
 */
const listConversations = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$conversationId',
          participants: { $addToSet: '$senderId' },
          messageCount: { $sum: 1 },
          lastMessageTime: { $max: '$createdAt' }
        }
      },
      { $sort: { lastMessageTime: -1 } },
      { $limit: limit }
    ]);

    return res.json({
      success: true,
      data: conversations.map((c) => ({
        conversationId: c._id,
        participants: c.participants,
        messageCount: c.messageCount,
        lastMessageTime: c.lastMessageTime
      }))
    });
  } catch (error) {
    console.error('[listConversations]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PATCH /api/admin/users/:id/status ─────────────────────
 * Suspend / activate a user account. Admins cannot suspend themselves.
 */
const setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive (boolean) is required' });
    }
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = isActive;
    await user.save();
    return res.json({ success: true, message: isActive ? 'User activated' : 'User suspended', data: sanitizeUserDoc(user) });
  } catch (error) {
    console.error('[setUserStatus]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── DELETE /api/admin/users/:id ───────────────────────────── */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await WorkerProfile.findOneAndDelete({ userId: user._id });
    await user.deleteOne();
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PATCH /api/admin/jobs/:id/status ──────────────────────
 * Moderate a job post — reopen or cancel any listing.
 */
const moderateJob = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be open or cancelled' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = status;
    await job.save();
    return res.json({ success: true, message: `Job ${status}`, data: { _id: job._id, status: job.status } });
  } catch (error) {
    console.error('[moderateJob]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  getStats,
  listUsers,
  listWorkers,
  listJobs,
  listConversations,
  setUserStatus,
  deleteUser,
  moderateJob
};
