const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  updateActiveMode,
  changePassword,
  logoutUser,
  verifyEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const isDev = process.env.NODE_ENV === 'development';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 50 : 3,
  message: { success: false, message: 'Too many registration attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  message: { success: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const minPasswordLength = isDev ? 6 : 10;

const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits'),
  body('password')
    .isLength({ min: minPasswordLength })
    .withMessage(`Password must be at least ${minPasswordLength} characters`),
  body('location').optional()
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const googleValidation = [
  body('credential').optional().isString(),
  body('email').optional().isEmail(),
  body('name').optional(),
  body('googleId').optional()
];

function googleBodyGuard(req, res, next) {
  if (req.body.credential) return next();
  if (req.body.email && req.body.googleId) return next();
  return res.status(400).json({
    success: false,
    message: 'Provide Google credential (ID token) or email + googleId'
  });
}

// Public routes
router.post('/register', registerLimiter, registerValidation, registerUser);
router.post('/login',    loginLimiter,    loginValidation,    loginUser);
router.post('/google',   googleLimiter,   googleValidation,   googleBodyGuard, googleLogin);
router.get('/verify-email', verifyEmail);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.patch('/mode', protect, updateActiveMode);
router.put('/change-password', protect, changePassword);

module.exports = router;