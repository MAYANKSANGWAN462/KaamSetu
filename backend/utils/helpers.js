// Purpose: API helpers, Haversine distance, and smart ranking for workers/jobs lists.

const formatResponse = (data, message = 'Success', status = 200) => ({
  success: status >= 200 && status < 300,
  message,
  data,
  timestamp: new Date()
});

const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Great-circle distance between two WGS84 points (km).
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Alias for spec naming */
const calculateDistance = haversineDistance;

function clamp01(x) {
  if (!Number.isFinite(x)) return 0.5;
  return Math.max(0, Math.min(1, x));
}

/**
 * 1 = at reference point, 0 = at or beyond maxKm (linear falloff).
 */
function distanceScore(distanceKm, maxKm = 100) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return 0.5;
  return clamp01(1 - distanceKm / Math.max(maxKm, 0.001));
}

/** Higher pay is better (worker browsing jobs). */
function wageScoreHigherBetter(amount, minW, maxW) {
  if (!Number.isFinite(amount)) return 0.5;
  if (!Number.isFinite(minW) || !Number.isFinite(maxW) || maxW <= minW) return 0.5;
  return clamp01((amount - minW) / (maxW - minW));
}

/** Lower wage demand is better (hirer browsing workers). */
function wageScoreLowerBetter(amount, minW, maxW) {
  if (!Number.isFinite(amount)) return 0.5;
  if (!Number.isFinite(minW) || !Number.isFinite(maxW) || maxW <= minW) return 0.5;
  return clamp01(1 - (amount - minW) / (maxW - minW));
}

function ratingScore(avgRating, maxRating = 5) {
  return clamp01((Number(avgRating) || 0) / maxRating);
}

const DEFAULT_RECENCY_MS = 30 * 24 * 60 * 60 * 1000;

/** Newer items score higher. */
function recencyScore(createdAt, maxAgeMs = DEFAULT_RECENCY_MS) {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return 0.5;
  const age = Date.now() - t;
  return clamp01(1 - age / Math.max(maxAgeMs, 1));
}

/**
 * Composite smart score (0–1 scale internally).
 * perspective: "worker" (listing jobs) | "hirer" (listing workers)
 */
function smartScore(
  { distanceKm, wageAmount, ratingAvg, createdAt },
  { perspective, wageMin, wageMax, maxDistanceKm = 100 }
) {
  const d = distanceScore(distanceKm, maxDistanceKm);
  const w =
    perspective === 'worker'
      ? wageScoreHigherBetter(wageAmount, wageMin, wageMax)
      : wageScoreLowerBetter(wageAmount, wageMin, wageMax);
  const r = ratingScore(ratingAvg);
  const c = recencyScore(createdAt);
  return 0.4 * d + 0.25 * w + 0.25 * r + 0.1 * c;
}

function wageBoundsFromAmounts(amounts) {
  const valid = amounts.filter((n) => Number.isFinite(n) && n >= 0);
  if (!valid.length) return { min: 0, max: 1 };
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return min === max ? { min: Math.max(0, min - 1), max: max + 1 } : { min, max };
}

/**
 * Escape a user-supplied string for safe use inside a RegExp and cap its length.
 * Prevents regex injection / ReDoS on public search inputs.
 */
const safeRegex = (str, maxLen = 80) =>
  String(str || '')
    .trim()
    .slice(0, maxLen)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateIndianPhone = (phone) => /^[6-9]\d{9}$/.test(String(phone || ''));

const formatIndianCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  formatResponse,
  paginate,
  calculateDistance,
  haversineDistance,
  distanceScore,
  wageScoreHigherBetter,
  wageScoreLowerBetter,
  ratingScore,
  recencyScore,
  smartScore,
  wageBoundsFromAmounts,
  clamp01,
  safeRegex,
  validateIndianPhone,
  formatIndianCurrency,
  calculateAge,
  generateOTP,
  sanitizeInput
};
