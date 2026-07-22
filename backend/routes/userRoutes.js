// const express = require('express');
// const router = express.Router();
// const {
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   getUserStats
// } = require('../controllers/userController');
// const { protect, authorize } = require('../middleware/authMiddleware');

// // Public routes
// router.get('/:id', getUserById);

// // Admin-only routes
// // NOTE: /stats must be registered on a separate router or
// // before /:id — but since /:id is already registered above,
// // we protect these with full paths explicitly
// router.get('/',        protect, authorize('admin'), getAllUsers);
// router.get('/stats',   protect, authorize('admin'), getUserStats);
// router.put('/:id',     protect, authorize('admin'), updateUser);
// router.delete('/:id',  protect, authorize('admin'), deleteUser);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

// Static routes FIRST — before any /:id
router.get('/',       protect, authorize('admin'), getAllUsers);
router.get('/stats',  protect, authorize('admin'), getUserStats);

// Dynamic route LAST — optionalAuth so contact info can be interaction-gated
router.get('/:id',    optionalAuth, getUserById);
router.put('/:id',    protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;