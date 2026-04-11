const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_COOKIE_NAME } = require('../utils/generateToken');

function extractToken(req) {
  const fromCookie = req.cookies && req.cookies[JWT_COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  return null;
}

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated. Please contact admin.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

/**
 * Attaches req.user when a valid token is present; never sends 401.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    req.user = user && user.isActive !== false ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Requires req.user.activeMode === mode (after protect).
 */
const requireMode = (mode) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (req.user.activeMode !== mode) {
    return res.status(403).json({
      success: false,
      message: `This action requires ${mode} mode`
    });
  }
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `User role '${req.user.role}' is not authorized to access this route`
    });
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  requireMode,
  authorize,
  extractToken,
  JWT_COOKIE_NAME
};
