const Job = require('../models/Job');
const Application = require('../models/Application');
const { getIo } = require('../config/socket');
const { isValidCategory, CATEGORY_SLUGS } = require('../constants/categories');
const {
  haversineDistance,
  smartScore,
  wageBoundsFromAmounts
} = require('../utils/helpers');

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeJobLocation(loc) {
  if (loc == null) return { lat: undefined, lng: undefined, address: '' };
  if (typeof loc === 'string') {
    return { lat: undefined, lng: undefined, address: loc.trim().slice(0, 200) };
  }
  const lat = loc.lat ?? loc.latitude;
  const lng = loc.lng ?? loc.longitude;
  return {
    lat: Number.isFinite(Number(lat)) ? Number(lat) : undefined,
    lng: Number.isFinite(Number(lng)) ? Number(lng) : undefined,
    address: String(loc.address || loc.city || '').trim().slice(0, 200)
  };
}

function parseWage(body) {
  const w = body.wage || {};
  const amount = toNum(w.amount ?? body.wageAmount ?? body.budget, 0);
  const unit = ['hourly', 'daily', 'job'].includes(w.unit) ? w.unit : 'daily';
  return { amount: Math.max(0, amount), unit };
}

/* ─── POST /api/jobs ──────────────────────────────────────── */

const createJob = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'title, description, and category are required'
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid values: ${CATEGORY_SLUGS.join(', ')}`
      });
    }

    const loc = normalizeJobLocation(req.body.location);
    if (!loc.address && (loc.lat == null || loc.lng == null)) {
      return res.status(400).json({
        success: false,
        message: 'location must include address or lat/lng coordinates'
      });
    }

    const wage = parseWage(req.body);
    const workersRequired = Math.max(1, toNum(req.body.workersRequired, 1));
    const duration = String(req.body.duration || '').trim().slice(0, 100);
    const requiredSkills = Array.isArray(req.body.requiredSkills)
      ? req.body.requiredSkills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
      : [];

    let startDate = null;
    if (req.body.startDate) {
      const d = new Date(req.body.startDate);
      if (!Number.isNaN(d.getTime())) startDate = d;
    }

    const job = await Job.create({
      hirerId: req.user._id,
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      wage,
      workersRequired,
      duration,
      requiredSkills,
      location: loc,
      status: 'open',
      startDate
    });

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    console.error('[createJob]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/jobs ───────────────────────────────────────── */

const getJobs = async (req, res) => {
  try {
    const {
      q,
      category,
      status,
      page = 1,
      limit = 10,
      sort = 'recent',
      lat,
      lng,
      latitude,
      longitude,
      radiusKm = 50,
      minWage,
      maxWage
    } = req.query;

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

    if (q && String(q).trim()) {
      const re = new RegExp(String(q).trim(), 'i');
      query.$or = [{ title: re }, { description: re }];
    }

    // Default to open jobs only unless explicitly requested
    query.status = (status && status !== 'all') ? status : 'open';

    const jobs = await Job.find(query)
      .populate('hirerId', 'name email profilePhoto location')
      .sort({ createdAt: -1 })
      .lean();

    const searchLat = Number.isFinite(Number(lat ?? latitude))
      ? Number(lat ?? latitude)
      : null;
    const searchLng = Number.isFinite(Number(lng ?? longitude))
      ? Number(lng ?? longitude)
      : null;
    const maxDist = Math.min(200, Math.max(5, toNum(radiusKm, 50)));

    const wageAmounts = jobs.map((j) => toNum(j.wage?.amount, 0));
    const { min: wageMin, max: wageMax } = wageBoundsFromAmounts(wageAmounts);

    let enriched = jobs.map((job) => {
      const jobLat = job.location?.lat;
      const jobLng = job.location?.lng;

      const distanceKm =
        searchLat !== null &&
        searchLng !== null &&
        Number.isFinite(jobLat) &&
        Number.isFinite(jobLng)
          ? haversineDistance(searchLat, searchLng, jobLat, jobLng)
          : null;

      const wageVal = toNum(job.wage?.amount, 0);
      const score = smartScore(
        { distanceKm, wageAmount: wageVal, ratingAvg: 0, createdAt: job.createdAt },
        { perspective: 'worker', wageMin, wageMax, maxDistanceKm: maxDist }
      );

      return { ...job, distanceKm, smartScore: score, wageValue: wageVal };
    });

    // Distance filter
    if (searchLat !== null && searchLng !== null) {
      enriched = enriched.filter(
        (j) => j.distanceKm === null || j.distanceKm <= maxDist
      );
    }

    // Wage range filter
    if (minWage) enriched = enriched.filter((j) => j.wageValue >= toNum(minWage, 0));
    if (maxWage) enriched = enriched.filter((j) => j.wageValue <= toNum(maxWage, Infinity));

    // Sort — matches master spec SORT_OPTIONS
    enriched.sort((a, b) => {
      switch (sort) {
        case 'distance':
          return (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9);
        case 'wage':
          return (b.wageValue ?? 0) - (a.wageValue ?? 0);
        case 'rating':
          return 0; // jobs don't have ratings — fall through to recent
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    const pageNum = Math.max(1, toNum(page, 1));
    const limitNum = Math.min(50, Math.max(1, toNum(limit, 10)));
    const start = (pageNum - 1) * limitNum;
    const pageRows = enriched.slice(start, start + limitNum);

    return res.json({
      success: true,
      data: {
        jobs: pageRows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: enriched.length,
          totalPages: Math.ceil(enriched.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('[getJobs]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/jobs/mine ──────────────────────────────────── */

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ hirerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return { ...job, applicationCount };
      })
    );

    return res.json({ success: true, data: jobsWithCounts });
  } catch (error) {
    console.error('[getMyJobs]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/jobs/:id ───────────────────────────────────── */

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('hirerId', 'name email phone location profilePhoto')
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Only return application count publicly — not the full applicant list
    const applicationCount = await Application.countDocuments({ jobId: job._id });

    return res.json({
      success: true,
      data: { ...job, applicationCount }
    });
  } catch (error) {
    console.error('[getJobById]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PUT /api/jobs/:id ───────────────────────────────────── */

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.hirerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Only open jobs can be updated'
      });
    }

    if (req.body.title !== undefined) job.title = String(req.body.title).trim();
    if (req.body.description !== undefined)
      job.description = String(req.body.description).trim();

    if (req.body.category !== undefined) {
      if (!isValidCategory(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Valid values: ${CATEGORY_SLUGS.join(', ')}`
        });
      }
      job.category = String(req.body.category).trim();
    }

    if (req.body.workersRequired !== undefined) {
      job.workersRequired = Math.max(1, toNum(req.body.workersRequired, 1));
    }
    if (req.body.duration !== undefined) {
      job.duration = String(req.body.duration || '').trim().slice(0, 100);
    }
    if (req.body.requiredSkills !== undefined) {
      job.requiredSkills = Array.isArray(req.body.requiredSkills)
        ? req.body.requiredSkills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
        : [];
    }
    if (req.body.location !== undefined) {
      job.location = normalizeJobLocation(req.body.location);
    }
    if (
      req.body.wage !== undefined ||
      req.body.wageAmount !== undefined ||
      req.body.budget !== undefined
    ) {
      job.wage = parseWage(req.body);
    }
    if (req.body.startDate !== undefined) {
      if (!req.body.startDate) {
        job.startDate = null;
      } else {
        const d = new Date(req.body.startDate);
        if (!Number.isNaN(d.getTime())) job.startDate = d;
      }
    }

    await job.save();

    return res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('[updateJob]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── DELETE /api/jobs/:id → sets status: cancelled ──────── */

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.hirerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this job'
      });
    }

    if (job.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Job is already cancelled'
      });
    }

    // Soft delete — set status to cancelled, never hard delete
    job.status = 'cancelled';
    await job.save();

    // Notify via socket
    try {
      const io = getIo();
      io.to(job.hirerId.toString()).emit('jobCancelled', {
        jobId: job._id.toString(),
        title: job.title
      });
    } catch (socketErr) {
      console.warn('[deleteJob] Socket emit skipped:', socketErr.message);
    }

    return res.json({
      success: true,
      message: 'Job cancelled successfully',
      data: { _id: job._id, status: job.status }
    });
  } catch (error) {
    console.error('[deleteJob]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PATCH /api/jobs/:id/status ─────────────────────────── */
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be open or cancelled' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.hirerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    job.status = status;
    await job.save();
    return res.json({ success: true, message: `Job ${status}`, data: { _id: job._id, status: job.status } });
  } catch (error) {
    console.error('[updateJobStatus]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports = { createJob, getJobs, getMyJobs, getJobById, updateJob, deleteJob, updateJobStatus };