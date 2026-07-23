const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { setTokenCookie, clearTokenCookie } = require('../utils/generateToken');
const { sanitizeUserDoc } = require('../utils/sanitizeUser');

/* ─── Email ─────────────────────────────────────────────── */

async function sendVerificationEmail(toEmail, token) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[auth] Email not configured — skipping verification email');
    return;
  }
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"KaamSetu" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your KaamSetu account',
    text: `Click to verify your email: ${link}`,
    html: `
      <h2>Welcome to KaamSetu!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${link}" style="
        display:inline-block;padding:12px 24px;
        background:#7C3AED;color:#fff;
        border-radius:6px;text-decoration:none;
      ">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create this account, ignore this email.</p>
    `
  });
}

/* ─── Helpers ────────────────────────────────────────────── */

function normalizeLocationInput(location) {
  if (location == null || location === '') return undefined;
  if (typeof location === 'object' && !Array.isArray(location)) {
    return {
      lat: typeof location.lat === 'number' ? location.lat : undefined,
      lng: typeof location.lng === 'number' ? location.lng : undefined,
      city: String(location.city || '').trim().slice(0, 120),
      area: String(location.area || '').trim().slice(0, 120)
    };
  }
  const s = String(location).trim();
  if (!s) return undefined;
  return { city: s.slice(0, 120), area: '', lat: undefined, lng: undefined };
}

function buildSafeUser(user) {
  const plain = sanitizeUserDoc(user);
  if (!plain) return null;
  return {
    _id: plain._id,
    name: plain.name,
    email: plain.email,
    phone: plain.phone || '',
    role: plain.role || 'user',
    activeMode: plain.activeMode ?? null,
    location: plain.location || {},
    profilePhoto: plain.profilePhoto || '',
    isVerified: Boolean(plain.isVerified),
    createdAt: plain.createdAt
  };
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{10,}$/;

/* ─── Controllers ────────────────────────────────────────── */

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;
    const isDev = process.env.NODE_ENV === 'development';
    const emailNormalized = String(email || '').toLowerCase().trim();

    if (!name || !emailNormalized || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (isDev) {
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
    } else {
      if (!PASSWORD_REGEX.test(String(password))) {
        return res.status(400).json({
          success: false,
          message:
            'Password must be at least 10 characters and include uppercase, lowercase, number, and special character'
        });
      }
    }

    const phoneDigits =
      phone != null && String(phone).trim() !== '' ? String(phone).trim() : '';
    const duplicateQuery = [{ email: emailNormalized }];
    if (phoneDigits && /^[0-9]{10}$/.test(phoneDigits)) {
      duplicateQuery.push({ phone: phoneDigits });
    }

    const existing = await User.findOne({ $or: duplicateQuery });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(String(password), salt);

    const createPayload = {
      name: String(name).trim(),
      email: emailNormalized,
      passwordHash,
      role: 'user',
      isActive: true,
      activeMode: null,
      isVerified: isDev
    };

    if (!isDev) {
      createPayload.verificationToken = crypto.randomBytes(32).toString('hex');
      createPayload.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    if (phoneDigits && /^[0-9]{10}$/.test(phoneDigits)) {
      createPayload.phone = phoneDigits;
    }

    const loc = normalizeLocationInput(location);
    if (loc) createPayload.location = loc;

    const user = await User.create(createPayload);
    const userPayload = buildSafeUser(user);
    const token = setTokenCookie(res, user._id);

    if (!isDev && createPayload.verificationToken) {
      sendVerificationEmail(emailNormalized, createPayload.verificationToken).catch(
        (err) => console.error('[auth] Verification email failed:', err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: isDev
        ? 'Account created! You can now log in.'
        : 'Registration successful. Please verify your email before logging in.',
      token,
      data: userPayload
    });
  } catch (error) {
    console.error('[registerUser]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors)[0]?.message || 'Validation failed';
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDev = process.env.NODE_ENV === 'development';
    const emailNormalized = String(email || '').toLowerCase().trim();

    if (!emailNormalized || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: emailNormalized }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact admin.'
      });
    }

    if (!isDev && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const userPayload = buildSafeUser(user);
    const token = setTokenCookie(res, user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      data: userPayload
    });
  } catch (error) {
    console.error('[loginUser]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { code, credential } = req.body;

    if (!code && !credential) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization code is required'
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google login is not configured on this server'
      });
    }

    let payload;

    if (code) {
      // Auth-code flow (popup opened from your own button — never blocked by browsers)
      const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'postmessage',
      });
      let tokens;
      try {
        const tokenResponse = await client.getToken(code);
        tokens = tokenResponse.tokens;
      } catch (err) {
        console.error('[googleLogin] Code exchange failed:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid Google authorization code' });
      }
      const verifyClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      let ticket;
      try {
        ticket = await verifyClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch (err) {
        console.error('[googleLogin] Token verification failed:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }
      payload = ticket.getPayload();
    } else {
      // Legacy credential flow (kept for backward compatibility)
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
      } catch (err) {
        console.error('[googleLogin] Token verification failed:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }
      payload = ticket.getPayload();
    }
    if (!payload?.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google payload' });
    }

    const { sub: googleId, name, email, picture } = payload;
    const emailNormalized = email.toLowerCase().trim();

    let user = await User.findOne({ $or: [{ googleId }, { email: emailNormalized }] });

    if (!user) {
      user = await User.create({
        name: name || emailNormalized.split('@')[0],
        email: emailNormalized,
        googleId,
        profilePhoto: picture || '',
        passwordHash: `google_${googleId}_${Date.now()}`,
        isVerified: true,
        role: 'user',
        isActive: true,
        activeMode: null
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePhoto && picture) user.profilePhoto = picture;
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const userPayload = buildSafeUser(user);
    const token = setTokenCookie(res, user._id);

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      data: userPayload
    });
  } catch (error) {
    console.error('[googleLogin]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: buildSafeUser(user) });
  } catch (error) {
    console.error('[getUserProfile]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone || '';

    const loc = normalizeLocationInput(req.body.location);
    if (loc) user.location = loc;

    const photo = req.body.profilePhoto || req.body.profileImage;
    if (photo) user.profilePhoto = photo;

    // NOTE: email and role are NOT updatable here
    // activeMode is updated via PATCH /api/auth/mode only

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: buildSafeUser(updatedUser)
    });
  } catch (error) {
    console.error('[updateUserProfile]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isDev = process.env.NODE_ENV === 'development';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (isDev) {
      if (String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }
    } else {
      if (!PASSWORD_REGEX.test(String(newPassword))) {
        return res.status(400).json({
          success: false,
          message:
            'New password must be at least 10 characters and include uppercase, lowercase, number, and special character'
        });
      }
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[changePassword]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logoutUser = async (req, res) => {
  try {
    clearTokenCookie(res);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[logoutUser]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({ verificationToken: token }).select(
      '+verificationToken +verificationExpiry'
    );

    if (!user || !user.verificationExpiry || user.verificationExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. Please register again.'
      });
    }

    user.isVerified = true;
    user.verificationToken = '';
    user.verificationExpiry = null;
    await user.save();

    return res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('[verifyEmail]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateActiveMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['worker', 'hirer'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid mode. Must be "worker" or "hirer"' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { activeMode: mode } },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: buildSafeUser(user) });
  } catch (error) {
    console.error('[updateActiveMode]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  updateActiveMode,
  changePassword,
  logoutUser,
  verifyEmail
};