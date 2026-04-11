const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'verificationToken',
  'verificationExpiry'
]);

/**
 * Returns a plain object safe for JSON responses (no password or verification secrets).
 */
function sanitizeUserDoc(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  SENSITIVE_KEYS.forEach((key) => {
    delete plain[key];
  });
  return plain;
}

module.exports = { sanitizeUserDoc, SENSITIVE_KEYS };
