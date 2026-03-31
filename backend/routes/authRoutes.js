// Purpose: Defines authentication endpoints and validation rules.
// Authentication routes for user registration, login, and Google OAuth
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().matches(/^[0-9]{10}$/),
  body('language').optional().isIn(['en', 'hi', 'pa', 'ta', 'bn']),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('location').optional()
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const googleValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('name').optional(),
  body('picture').optional(),
  body('googleId').notEmpty().withMessage('Google ID is required')
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/google', googleValidation, googleLogin);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;