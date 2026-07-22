const Application = require('../models/Application');

/**
 * True when an Application record links the two users in either direction
 * (worker applied to hirer, or hirer contacted worker). This is the gate that
 * unlocks messaging and mutual contact-info visibility.
 */
async function hasInteraction(userAId, userBId) {
  if (!userAId || !userBId) return false;
  const a = userAId.toString();
  const b = userBId.toString();
  if (a === b) return false;
  const record = await Application.findOne({
    $or: [
      { workerId: a, hirerId: b },
      { workerId: b, hirerId: a }
    ]
  })
    .select('_id')
    .lean();
  return Boolean(record);
}

module.exports = { hasInteraction };
