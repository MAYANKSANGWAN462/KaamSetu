/**
 * Diagnostic: verify the admin account state in the connected MongoDB.
 * Run from backend/ directory: node scripts/verifyAdmin.js <email>
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

async function main() {
  const email = (process.argv[2] || 'admin@kaamsetu.com').toLowerCase().trim();

  console.log('\n🔍 Connecting to:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':***@') || '(MONGODB_URI not set)');
  await connectDB();

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    console.log(`\n❌ No user found with email: ${email}`);
    console.log('   → Run: node scripts/makeAdmin.js admin@kaamsetu.com YourPassword123 "Administrator"');
  } else {
    const isHash = typeof user.passwordHash === 'string' && user.passwordHash.startsWith('$2');
    console.log(`\n✅ User found: ${user.email}`);
    console.log(`   role      : ${user.role}`);
    console.log(`   isActive  : ${user.isActive}`);
    console.log(`   isVerified: ${user.isVerified}`);
    console.log(`   passwordHash is bcrypt: ${isHash ? '✅ YES' : '❌ NO (plain text — script must be re-run)'}`);

    if (isHash) {
      const testPassword = process.argv[3];
      if (testPassword) {
        const match = await bcrypt.compare(testPassword, user.passwordHash);
        console.log(`   bcrypt.compare("${testPassword}", hash) = ${match ? '✅ MATCH — login should work' : '❌ NO MATCH — wrong password'}`);
      } else {
        console.log('   (pass the password as 2nd arg to test comparison: node scripts/verifyAdmin.js <email> <password>)');
      }
    }
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ verifyAdmin failed:', err.message);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
