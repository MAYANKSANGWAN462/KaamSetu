/**
 * One-time migration: copy all users from the sambandh database into kaamsetu.
 * Safe to re-run — already-existing emails are skipped (no overwrites).
 *
 * Run from the backend/ directory:
 *   node scripts/migrateSambandh.js
 *
 * Requirements: MONGODB_URI in .env must point to the kaamsetu database.
 * The script derives the sambandh URI automatically by swapping the database name.
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

function swapDb(uri, targetDb) {
  // Handles both   .../dbname?...   and   .../dbname   (no query string)
  return uri.replace(/\/([^/?]+)(\?|$)/, `/${targetDb}$2`);
}

async function main() {
  const kaamsetuUri = process.env.MONGODB_URI;
  if (!kaamsetuUri) {
    console.error('❌  MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const sambandhUri = swapDb(kaamsetuUri, 'sambandh');
  const kaamsetuUriFixed = swapDb(kaamsetuUri, 'kaamsetu');

  console.log('\n📦  Source      (sambandh):', sambandhUri.replace(/:([^@]+)@/, ':***@'));
  console.log('🎯  Destination (kaamsetu):', kaamsetuUriFixed.replace(/:([^@]+)@/, ':***@'));
  console.log('');

  const srcClient = new MongoClient(sambandhUri);
  const dstClient = new MongoClient(kaamsetuUriFixed);

  try {
    await srcClient.connect();
    await dstClient.connect();

    const src = srcClient.db('sambandh');
    const dst = dstClient.db('kaamsetu');

    // ── Users ──────────────────────────────────────────────────────────
    const srcUsers = src.collection('users');
    const dstUsers = dst.collection('users');

    const allSrcUsers = await srcUsers.find({}).toArray();
    console.log(`👤  Found ${allSrcUsers.length} users in sambandh`);

    let usersMigrated = 0;
    let usersSkipped = 0;

    for (const user of allSrcUsers) {
      const exists = await dstUsers.findOne({ email: user.email });
      if (exists) {
        usersSkipped++;
      } else {
        await dstUsers.insertOne(user);
        usersMigrated++;
      }
    }

    console.log(`   ✅  Migrated : ${usersMigrated}`);
    console.log(`   ⏭️   Skipped  : ${usersSkipped} (email already in kaamsetu)`);
    console.log('');

    // ── WorkerProfiles ─────────────────────────────────────────────────
    const srcProfiles = src.collection('workerprofiles');
    const dstProfiles = dst.collection('workerprofiles');

    const allProfiles = await srcProfiles.find({}).toArray();
    console.log(`🔧  Found ${allProfiles.length} worker profiles in sambandh`);

    let profilesMigrated = 0;
    let profilesSkipped = 0;

    for (const profile of allProfiles) {
      const exists = await dstProfiles.findOne({ userId: profile.userId });
      if (exists) {
        profilesSkipped++;
      } else {
        await dstProfiles.insertOne(profile);
        profilesMigrated++;
      }
    }

    console.log(`   ✅  Migrated : ${profilesMigrated}`);
    console.log(`   ⏭️   Skipped  : ${profilesSkipped}`);
    console.log('');

    // ── Jobs ───────────────────────────────────────────────────────────
    const srcJobs = src.collection('jobs');
    const dstJobs = dst.collection('jobs');

    const allJobs = await srcJobs.find({}).toArray();
    console.log(`💼  Found ${allJobs.length} jobs in sambandh`);

    let jobsMigrated = 0;
    let jobsSkipped = 0;

    for (const job of allJobs) {
      const exists = await dstJobs.findOne({ _id: job._id });
      if (exists) {
        jobsSkipped++;
      } else {
        await dstJobs.insertOne(job);
        jobsMigrated++;
      }
    }

    console.log(`   ✅  Migrated : ${jobsMigrated}`);
    console.log(`   ⏭️   Skipped  : ${jobsSkipped}`);
    console.log('');

    // ── Applications ───────────────────────────────────────────────────
    const srcApps = src.collection('applications');
    const dstApps = dst.collection('applications');

    const allApps = await srcApps.find({}).toArray();
    console.log(`📋  Found ${allApps.length} applications in sambandh`);

    let appsMigrated = 0;
    let appsSkipped = 0;

    for (const app of allApps) {
      const exists = await dstApps.findOne({ _id: app._id });
      if (exists) {
        appsSkipped++;
      } else {
        await dstApps.insertOne(app);
        appsMigrated++;
      }
    }

    console.log(`   ✅  Migrated : ${appsMigrated}`);
    console.log(`   ⏭️   Skipped  : ${appsSkipped}`);
    console.log('');

    // ── Messages ───────────────────────────────────────────────────────
    const srcMsgs = src.collection('messages');
    const dstMsgs = dst.collection('messages');

    const allMsgs = await srcMsgs.find({}).toArray();
    console.log(`💬  Found ${allMsgs.length} messages in sambandh`);

    let msgsMigrated = 0;
    let msgsSkipped = 0;

    for (const msg of allMsgs) {
      const exists = await dstMsgs.findOne({ _id: msg._id });
      if (exists) {
        msgsSkipped++;
      } else {
        await dstMsgs.insertOne(msg);
        msgsMigrated++;
      }
    }

    console.log(`   ✅  Migrated : ${msgsMigrated}`);
    console.log(`   ⏭️   Skipped  : ${msgsSkipped}`);
    console.log('');

    console.log('🎉  Migration complete!');
    console.log('   All sambandh data that was missing from kaamsetu has been copied.');
    console.log('   You can now safely update Render\'s MONGODB_URI to use kaamsetu.');

  } finally {
    await srcClient.close();
    await dstClient.close();
  }
}

main().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
