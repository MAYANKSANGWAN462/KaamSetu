const jwt = require('jsonwebtoken');

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'kaamsetu_token';

function parseExpiryToMs(exp) {
  if (!exp) return 30 * 24 * 60 * 60 * 1000;
  const s = String(exp).trim();
  const m = s.match(/^(\d+)([dhms])$/i);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return n * (mult[unit] || 86400000);
}

const getJwtExpiresIn = () =>
  process.env.JWT_EXPIRE || process.env.JWT_EXPIRY || process.env.JWT_EXPIRES_IN || '30d';

/**
 * Sign JWT with user id payload (used by Authorization header and cookies).
 */
const signToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    throw new Error(
      'JWT_SECRET is missing or empty. Set it in backend/.env (quote the value if it contains #).'
    );
  }
  return jwt.sign({ id: String(id) }, secret, { expiresIn: getJwtExpiresIn() });
};

/** Backward-compatible name */
const generateToken = signToken;

/**
 * Set httpOnly cookie + return the same token (client may still use Bearer).
 */
const setTokenCookie = (res, userId) => {
  const token = signToken(userId);
  const maxAge = parseExpiryToMs(getJwtExpiresIn());
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    // 'none' required for cross-domain (Vercel frontend ↔ Render backend)
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge
  });
  return token;
};

const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(JWT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 0
  });
};

module.exports = {
  signToken,
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  JWT_COOKIE_NAME,
  parseExpiryToMs,
  getJwtExpiresIn
};
