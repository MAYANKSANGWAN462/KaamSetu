const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { sanitizeUserDoc } = require('../utils/sanitizeUser');

// GET /api/users — admin only
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments()
    ]);

    return res.json({
      success: true,
      data: users,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('[getAllUsers]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/users/:id — public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const plain = sanitizeUserDoc(user);
    const workerProfile = await WorkerProfile.findOne({ userId: user._id }).lean();

    return res.json({
      success: true,
      data: {
        ...plain,
        workerProfile: workerProfile || null
      }
    });
  } catch (error) {
    console.error('[getUserById]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/users/:id — admin only
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone || '';
    if (req.body.location) user.location = req.body.location;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

    // Admin can change role but NOT activeMode via this route
    if (req.body.role && ['user', 'admin'].includes(req.body.role)) {
      user.role = req.body.role;
    }

    const updated = await user.save();
    const plain = sanitizeUserDoc(updated);

    return res.json({ success: true, data: plain });
  } catch (error) {
    console.error('[updateUser]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/users/:id — admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete worker profile if exists
    await WorkerProfile.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/users/stats — admin only
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      workersCount,
      hirersCount,
      activeUsers,
      workerProfiles
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ activeMode: 'worker' }),
      User.countDocuments({ activeMode: 'hirer' }),
      User.countDocuments({ isActive: true }),
      WorkerProfile.countDocuments()
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        workersCount,
        hirersCount,
        activeUsers,
        workerProfilesCreated: workerProfiles
      }
    });
  } catch (error) {
    console.error('[getUserStats]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
};