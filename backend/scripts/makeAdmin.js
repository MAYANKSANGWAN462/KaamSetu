/**
 * Promote an account to admin (creating it if it doesn't exist).
 *
 * Usage:
 *   node scripts/makeAdmin.js <email> [password] [name]
 *
 * - If the user exists, sets role='admin' (and resets the password when one is given).
 * - If the user doesn't exist, creates an admin account (password required).
 *
 * Run from the backend/ directory so .env is picked up.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const User = require('../models/User');

async function main() {
  const [, , emailArg, passwordArg, nameArg] = process.argv;
  const email = String(emailArg || '').toLowerCase().trim();

  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email> [password] [name]');
    process.exit(1);
  }

  await connectDB();

  // Hash the password here explicitly — do NOT rely on the pre-save hook,
  // which only fires on isModified() and behaves differently for new vs
  // existing documents depending on Mongoose version.
  let hashedPassword = null;
  if (passwordArg) {
    const salt = await bcrypt.genSalt(12);
    hashedPassword = await bcrypt.hash(String(passwordArg), salt);
  }

  let user = await User.findOne({ email }).select('+passwordHash');

  if (user) {
    user.role = 'admin';
    user.isActive = true;
    user.isVerified = true;
    if (hashedPassword) user.passwordHash = hashedPassword;
    await user.save();
    console.log(`✅ ${email} is now an admin.`);
  } else {
    if (!hashedPassword) {
      console.error('❌ User not found. Provide a password to create a new admin account.');
      await mongoose.connection.close();
      process.exit(1);
    }
    user = await User.create({
      name: nameArg || 'Administrator',
      email,
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true
    });
    console.log(`✅ Created admin account: ${email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ makeAdmin failed:', err.message);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
