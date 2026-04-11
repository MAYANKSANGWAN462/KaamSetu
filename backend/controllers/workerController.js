const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { CATEGORY_SLUGS, isValidCategory } = require('../constants/categories');
const {
  haversineDistance,
  smartScore,
  wageBoundsFromAmounts
} = require('../utils/helpers');

/* ─── Helpers ─────────────────────────────────────────────── */

function normalizeWorkerLocation(loc, userLocation) {
  if (loc == null && userLocation == null) {
    return { lat: undefined, lng: undefined, address: '' };
  }
  if (typeof loc === 'string') {
    return { lat: undefined, lng: undefined, address: String(loc).trim().slice(0, 200) };
  }
  const obj = loc || userLocation || {};
  const lat = obj.lat ?? obj.latitude;
  const lng = obj.lng ?? obj.longitude;
  return {
    lat: Number.isFinite(Number(lat)) ? Number(lat) : undefined,
    lng: Number.isFinite(Number(lng)) ? Number(lng) : undefined,
    address: String(obj.address || obj.city || '').trim().slice(0, 200)
  };
}

function parseWageFromBody(body) {
  const w = body.wage || {};
  const amount = Number(w.amount ?? body.dailyRate ?? body.hourlyRate ?? 0);
  const unitRaw = w.unit || body.wageUnit;
  const unit = ['hourly', 'daily', 'job'].includes(unitRaw) ? unitRaw : 'daily';
  return {
    amount: Math.max(0, Number.isFinite(amount) ? amount : 0),
    unit
  };
}

/* ─── GET /api/workers ────────────────────────────────────── */

const getWorkers = async (req, res) => {
  try {
    const {
      category,
      skill,
      isAvailable,
      minRating,
      minWage,
      maxWage,
      page = 1,
      limit = 10,
      sort = 'distance',
      lat,
      lng,
      latitude,
      longitude,
      radiusKm = 50
    } = req.query;

    // Build MongoDB query for indexed fields only
    const query = {};

    if (category && category !== 'all') {
      if (!isValidCategory(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Valid values: ${CATEGORY_SLUGS.join(', ')}`
        });
      }
      query.category = category;
    }

    if (isAvailable === 'true') query.isAvailable = true;
    if (isAvailable === 'false') query.isAvailable = false;

    // Skill filter via regex on skills array
    if (skill && String(skill).trim()) {
      query.skills = { $elemMatch: { $regex: String(skill).trim(), $options: 'i' } };
    }

    const workers = await WorkerProfile.find(query)
      .populate('userId', 'name email phone location profilePhoto')
      .lean();

    // Resolve coordinates — support both lat/lng and latitude/longitude param names
    const searchLat = Number.isFinite(Number(lat ?? latitude))
      ? Number(lat ?? latitude)
      : null;
    const searchLng = Number.isFinite(Number(lng ?? longitude))
      ? Number(lng ?? longitude)
      : null;
    const maxDist = Math.min(200, Math.max(5, Number(radiusKm) || 50));

    // Compute wage bounds for smart score normalization
    const wageAmounts = workers
      .map((w) => w.wage?.amount ?? 0)
      .filter((n) => Number.isFinite(n));
    const { min: wageMin, max: wageMax } = wageBoundsFromAmounts(wageAmounts);

    // Enrich each worker with distance + smart score
    let enriched = workers.map((w) => {
      const wLat = w.location?.lat;
      const wLng = w.location?.lng;
      const distanceKm =
        searchLat !== null &&
        searchLng !== null &&
        Number.isFinite(wLat) &&
        Number.isFinite(wLng)
          ? haversineDistance(searchLat, searchLng, wLat, wLng)
          : null;

      const ratingAvg = w.rating?.avg ?? 0;
      const wageVal = w.wage?.amount ?? 0;

      const score = smartScore(
        { distanceKm, wageAmount: wageVal, ratingAvg, createdAt: w.createdAt },
        { perspective: 'hirer', wageMin, wageMax, maxDistanceKm: maxDist }
      );

      return { ...w, distanceKm, smartScore: score };
    });

    // Filter out workers with no user (deleted accounts)
    enriched = enriched.filter((w) => w.userId);

    // Distance radius filter (JS side — no geospatial index)
    if (searchLat !== null && searchLng !== null) {
      enriched = enriched.filter(
        (w) => w.distanceKm === null || w.distanceKm <= maxDist
      );
    }

    // Rating filter
    if (minRating && parseFloat(minRating) > 0) {
      enriched = enriched.filter(
        (w) => (w.rating?.avg ?? 0) >= parseFloat(minRating)
      );
    }

    // Wage range filter
    if (minWage && String(minWage) !== '') {
      enriched = enriched.filter(
        (w) => (w.wage?.amount ?? 0) >= parseFloat(minWage)
      );
    }
    if (maxWage && String(maxWage) !== '') {
      enriched = enriched.filter(
        (w) => (w.wage?.amount ?? 0) <= parseFloat(maxWage)
      );
    }

    // Sort — matches master spec SORT_OPTIONS
    enriched.sort((a, b) => {
      switch (sort) {
        case 'distance':
          return (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9);
        case 'wage':
          return (b.wage?.amount ?? 0) - (a.wage?.amount ?? 0);
        case 'rating':
          return (b.rating?.avg ?? 0) - (a.rating?.avg ?? 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return (b.smartScore ?? 0) - (a.smartScore ?? 0);
      }
    });

    // Paginate
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const start = (pageNum - 1) * limitNum;
    const pageRows = enriched.slice(start, start + limitNum);

    return res.json({
      success: true,
      data: {
        workers: pageRows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: enriched.length,
          totalPages: Math.ceil(enriched.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('[getWorkers]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/workers/:id ────────────────────────────────── */

const getWorkerById = async (req, res) => {
  try {
    const worker = await WorkerProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name email phone location profilePhoto createdAt')
      .lean();

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const [reviews, ratingBreakdown] = await Promise.all([
      Review.find({ revieweeId: req.params.id })
        .populate('reviewerId', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Review.aggregate([
        { $match: { revieweeId: new mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    return res.json({
      success: true,
      data: { ...worker, reviews, ratingBreakdown }
    });
  } catch (error) {
    console.error('[getWorkerById]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── POST /api/workers/profile ──────────────────────────── */

const createWorkerProfile = async (req, res) => {
  try {
    const { skills, category, subCategory, bio, description } = req.body;

    // Validate category — must be from platform list
    const cat = category != null ? String(category).trim() : '';
    if (cat && !isValidCategory(cat)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid values: ${CATEGORY_SLUGS.join(', ')}`
      });
    }

    const sub = subCategory != null ? String(subCategory).trim() : '';
    const wage = parseWageFromBody(req.body);

    const skillList = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
      : [];

    const bioText = String(bio || description || '').trim().slice(0, 300);

    const user = await User.findById(req.user._id).lean();
    const loc = normalizeWorkerLocation(req.body.location, user?.location);

    let profile = await WorkerProfile.findOne({ userId: req.user._id });

    if (profile) {
      if (skillList.length) profile.skills = skillList;
      if (cat) profile.category = cat;
      if (sub) profile.subCategory = sub;
      if (bioText) profile.bio = bioText;
      profile.wage = wage;
      profile.location = loc;
      await profile.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    }

    if (!cat) {
      return res.status(400).json({
        success: false,
        message: 'Category is required to create a worker profile'
      });
    }

    profile = await WorkerProfile.create({
      userId: req.user._id,
      skills: skillList,
      category: cat,
      subCategory: sub,
      bio: bioText,
      wage,
      isAvailable: true,
      location: loc,
      portfolio: [],
      rating: { avg: 0, count: 0 }
    });

    return res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('[createWorkerProfile]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/workers/profile/me ────────────────────────── */

const getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone location profilePhoto')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No worker profile found. Please set up your profile.'
      });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('[getMyProfile]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PATCH /api/workers/availability ────────────────────── */

const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean (true or false)'
      });
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found. Create your profile first.'
      });
    }

    return res.json({
      success: true,
      message: `You are now marked as ${isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: profile.isAvailable }
    });
  } catch (error) {
    console.error('[updateAvailability]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── POST /api/workers/portfolio ────────────────────────── */

const uploadPortfolio = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found. Create your profile first.'
      });
    }

    const currentCount = (profile.portfolio || []).length;
    const maxAllowed = 5 - currentCount;

    if (maxAllowed <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio limit reached. Maximum 5 images allowed. Delete some to add more.'
      });
    }

    const filesToUpload = req.files.slice(0, maxAllowed);
    const uploadedUrls = [];

    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      const { uploadBufferToCloudinary } = require('../config/cloudinary');
      for (const file of filesToUpload) {
        const { url } = await uploadBufferToCloudinary(
          file.buffer,
          file.mimetype,
          'kaamsetu/portfolio'
        );
        if (url) uploadedUrls.push(url);
      }
    } else {
      console.warn('[uploadPortfolio] Cloudinary not configured — using placeholder URLs');
      filesToUpload.forEach((_, i) => {
        uploadedUrls.push(`placeholder-${Date.now()}-${i}`);
      });
    }

    profile.portfolio = [...profile.portfolio, ...uploadedUrls];
    await profile.save();

    return res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded`,
      data: { uploaded: uploadedUrls, portfolio: profile.portfolio }
    });
  } catch (error) {
    console.error('[uploadPortfolio]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── DELETE /api/workers/portfolio ──────────────────────── */

const deletePortfolioImage = async (req, res) => {
  try {
    const url = req.body?.url || req.query?.url || '';

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required in request body or query string'
      });
    }

    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const before = profile.portfolio.length;
    profile.portfolio = profile.portfolio.filter((u) => u !== url);

    if (profile.portfolio.length === before) {
      return res.status(404).json({
        success: false,
        message: 'Image URL not found in portfolio'
      });
    }

    await profile.save();

    return res.json({
      success: true,
      message: 'Image removed from portfolio',
      data: { portfolio: profile.portfolio }
    });
  } catch (error) {
    console.error('[deletePortfolioImage]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorkerProfile,
  getMyProfile,
  updateAvailability,
  uploadPortfolio,
  deletePortfolioImage
};