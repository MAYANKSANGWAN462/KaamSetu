const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/:id', getUserById);

// Admin only routes
router.use(protect, authorize('admin'));
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;