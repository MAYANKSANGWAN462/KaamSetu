const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'verificationToken',
  'verificationExpiry'
]);

// Contact / identity fields that must not leak to the public.
const PRIVATE_KEYS = new Set(['email', 'phone', 'googleId']);

/**
 * Returns a plain object safe for the account owner / admin (no password or
 * verification secrets, but keeps email/phone).
 */
function sanitizeUserDoc(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  SENSITIVE_KEYS.forEach((key) => {
    delete plain[key];
  });
  return plain;
}

/**
 * Public-facing projection. Strips PII (email/phone/googleId) unless the caller
 * explicitly has an interaction with this user (`includeContact`). City/area are
 * kept for locality display; precise coordinates are dropped.
 */
function toPublicUser(doc, { includeContact = false } = {}) {
  if (!doc) return null;
  const plain = sanitizeUserDoc(doc);
  if (!includeContact) {
    PRIVATE_KEYS.forEach((key) => {
      delete plain[key];
    });
  }
  if (plain.location) {
    plain.location = {
      city: plain.location.city || '',
      area: plain.location.area || ''
    };
  }
  return plain;
}

module.exports = { sanitizeUserDoc, toPublicUser, SENSITIVE_KEYS, PRIVATE_KEYS };
