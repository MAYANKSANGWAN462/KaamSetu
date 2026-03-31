// Purpose: Handles unified job lifecycle, applications, and personalized matching for the local marketplace.
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const { getIo } = require('../config/socket');

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeLocation = (locationInput = {}) => {
  if (typeof locationInput === 'string') {
    return {
      city: locationInput,
      latitude: null,
      longitude: null,
      coordinates: { type: 'Point', coordinates: [0, 0] }
    };
  }

  const city = locationInput.city || '';
  const latitude = toNumber(locationInput.latitude, null);
  const longitude = toNumber(locationInput.longitude, null);

  return {
    city,
    latitude,
    longitude,
    coordinates: {
      type: 'Point',
      coordinates: [longitude || 0, latitude || 0]
    }
  };
};

const normalizeSalary = (payload = {}) => {
  const salaryPayload = payload.salary || {};
  const mode = salaryPayload.mode || (payload.salaryMode || 'fixed');

  if (mode === 'range') {
    const min = toNumber(salaryPayload.min ?? payload.salaryMin, 0);
    const max = toNumber(salaryPayload.max ?? payload.salaryMax, min);
    const recommended = toNumber(salaryPayload.recommended ?? payload.recommendedSalary, Math.round((min + max) / 2));
    return {
      mode: 'range',
      min,
      max,
      recommended,
      fixed: null,
      budget: Math.round((min + max) / 2)
    };
  }

  const fixed = toNumber(salaryPayload.fixed ?? payload.budget, 0);
  const recommended = toNumber(salaryPayload.recommended ?? payload.recommendedSalary, fixed);

  return {
    mode: 'fixed',
    fixed,
    min: null,
    max: null,
    recommended,
    budget: fixed
  };
};

const salaryValue = (job) => {
  if (job.salary?.mode === 'range') {
    return Math.round((toNumber(job.salary?.min) + toNumber(job.salary?.max)) / 2);
  }
  return toNumber(job.salary?.fixed, toNumber(job.budget, 0));
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body;

    if (!title || !description || !category || !duration || !req.body.location) {
      return res.status(400).json({
        success: false,
        message: 'title, description, category, duration and location are required'
      });
    }

    const normalizedLocation = normalizeLocation(req.body.location);
    if (!normalizedLocation.city) {
      return res.status(400).json({
        success: false,
        message: 'location.city is required'
      });
    }

    const normalizedSalary = normalizeSalary(req.body);

    const job = await Job.create({
      createdBy: req.user._id,
      hirerId: req.user._id,
      title,
      description,
      category,
      location: normalizedLocation,
      salary: {
        mode: normalizedSalary.mode,
        fixed: normalizedSalary.fixed,
        min: normalizedSalary.min,
        max: normalizedSalary.max,
        recommended: normalizedSalary.recommended
      },
      budget: normalizedSalary.budget,
      workersRequired: Math.max(1, toNumber(req.body.workersRequired, 1)),
      requiredSkills: Array.isArray(req.body.requiredSkills)
        ? req.body.requiredSkills.map((skill) => String(skill).trim()).filter(Boolean)
        : [],
      duration,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all jobs with filters, personalization and ranking
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      q,
      category,
      location,
      minBudget,
      maxBudget,
      status,
      skill,
      latitude,
      longitude,
      radiusKm = 20,
      sortBy = 'latest',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (q && q.trim()) {
      const keywordRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: keywordRegex }, { description: keywordRegex }];
    }

    if (location && String(location).trim()) {
      query['location.city'] = { $regex: String(location).trim(), $options: 'i' };
    }

    query.status = status && status !== 'all' ? status : 'open';

    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const searchLat = Number.isFinite(toNumber(latitude, NaN)) ? Number(latitude) : null;
    const searchLng = Number.isFinite(toNumber(longitude, NaN)) ? Number(longitude) : null;
    const searchRadiusKm = Math.min(20, Math.max(5, toNumber(radiusKm, 20)));
    const skillNeedle = String(skill || '').trim().toLowerCase();

    const enrichedJobs = jobs
      .map((job) => {
        const jobLat = job.location?.latitude;
        const jobLng = job.location?.longitude;

        const distanceKm =
          searchLat !== null &&
          searchLng !== null &&
          Number.isFinite(jobLat) &&
          Number.isFinite(jobLng)
            ? haversineDistanceKm(searchLat, searchLng, jobLat, jobLng)
            : null;

        const skillCorpus = [
          ...(job.requiredSkills || []),
          job.title || '',
          job.description || '',
          job.category || ''
        ]
          .join(' ')
          .toLowerCase();

        const skillMatchScore = skillNeedle
          ? (skillCorpus.includes(skillNeedle) ? 1 : 0)
          : 0;

        return {
          ...job,
          hirerId: job.hirerId || job.createdBy,
          locationText: job.location?.city || '',
          distanceKm,
          skillMatchScore,
          salaryValue: salaryValue(job)
        };
      })
      .filter((job) => {
        if (minBudget && job.salaryValue < toNumber(minBudget, 0)) return false;
        if (maxBudget && job.salaryValue > toNumber(maxBudget, Number.MAX_SAFE_INTEGER)) return false;
        if (searchLat !== null && searchLng !== null && job.distanceKm !== null && job.distanceKm > searchRadiusKm) {
          return false;
        }
        return true;
      });

    const sortedJobs = [...enrichedJobs].sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
      }
      if (sortBy === 'salary') {
        return (b.salaryValue || 0) - (a.salaryValue || 0);
      }
      if (sortBy === 'skill') {
        return (b.skillMatchScore || 0) - (a.skillMatchScore || 0);
      }
      if (sortBy === 'time') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const pageNumber = Math.max(1, toNumber(page, 1));
    const pageSize = Math.max(1, toNumber(limit, 10));
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedJobs = sortedJobs.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: sortedJobs.length,
          totalPages: Math.ceil(sortedJobs.length / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'name email phone location profileImage')
      .populate('assignedWorkers', 'name phone')
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('workerId', 'name rating profileImage')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { ...job, applications } });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get jobs posted by current user
// @route   GET /api/jobs/my-jobs
// @access  Private
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate('assignedWorkers', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return { ...job, applicationCount };
      })
    );

    res.json({ success: true, data: jobsWithApplications });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Cannot update job that is not open' });
    }

    const allowedFields = ['title', 'description', 'category', 'duration', 'workersRequired', 'requiredSkills'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (req.body.location !== undefined) {
      job.location = normalizeLocation(req.body.location);
    }

    if (req.body.salary !== undefined || req.body.budget !== undefined) {
      const normalizedSalary = normalizeSalary(req.body);
      job.salary = {
        mode: normalizedSalary.mode,
        fixed: normalizedSalary.fixed,
        min: normalizedSalary.min,
        max: normalizedSalary.max,
        recommended: normalizedSalary.recommended
      };
      job.budget = normalizedSalary.budget;
    }

    await job.save();

    res.json({ success: true, message: 'Job updated successfully', data: job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await Promise.all([
      job.deleteOne(),
      Application.deleteMany({ jobId: job._id })
    ]);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
const applyForJob = async (req, res) => {
  try {
    const workerProfile = await WorkerProfile.findOne({ userId: req.user._id }).lean();
    if (!workerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Please create your worker profile before applying for jobs'
      });
    }

    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }

    if (job.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job' });
    }

    const existingApplication = await Application.findOne({
      jobId: job._id,
      workerId: req.user._id
    }).lean();

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const profileLat = workerProfile.coordinates?.latitude;
    const profileLng = workerProfile.coordinates?.longitude;
    const jobLat = job.location?.latitude;
    const jobLng = job.location?.longitude;

    const distanceKm =
      Number.isFinite(profileLat) &&
      Number.isFinite(profileLng) &&
      Number.isFinite(jobLat) &&
      Number.isFinite(jobLng)
        ? haversineDistanceKm(profileLat, profileLng, jobLat, jobLng)
        : null;

    const jobSkillCorpus = [job.category, ...(job.requiredSkills || []), job.title, job.description]
      .join(' ')
      .toLowerCase();

    const matchedSkillCount = (workerProfile.skills || []).filter((skill) =>
      jobSkillCorpus.includes(String(skill).toLowerCase())
    ).length;

    const application = await Application.create({
      jobId: job._id,
      workerId: req.user._id,
      status: 'pending',
      bidAmount: toNumber(req.body.bidAmount, salaryValue(job)),
      message: req.body.message || '',
      skillMatchScore: matchedSkillCount,
      distanceKm: distanceKm || 0
    });

    try {
      const io = getIo();
      io.to(job.createdBy.toString()).emit('jobApplicationNotification', {
        jobId: job._id.toString(),
        title: job.title,
        message: 'New worker applied for your job'
      });
    } catch (notificationError) {
      console.warn('Notification emit skipped:', notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('workerId', 'name email phone rating profileImage')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/:jobId/applications/:appId
// @access  Private
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const application = await Application.findOne({ _id: req.params.appId, jobId: job._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status === 'accepted') {
      const acceptedCount = await Application.countDocuments({ jobId: job._id, status: 'accepted' });
      if (acceptedCount >= job.workersRequired) {
        return res.status(400).json({
          success: false,
          message: `Only ${job.workersRequired} worker(s) can be accepted for this job`
        });
      }

      application.status = 'accepted';
      job.assignedWorkers = job.assignedWorkers || [];
      if (!job.assignedWorkers.some((workerId) => workerId.toString() === application.workerId.toString())) {
        job.assignedWorkers.push(application.workerId);
      }
      job.status = 'in-progress';
    } else {
      application.status = 'rejected';
    }

    application.respondedAt = Date.now();

    await Promise.all([application.save(), job.save()]);

    res.json({
      success: true,
      message: `Application ${status}`,
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get applications by worker
// @route   GET /api/jobs/applications/my
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user._id })
      .populate('jobId', 'title description salary budget location status workersRequired createdBy')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark job as completed
// @route   PUT /api/jobs/:id/complete
// @access  Private
const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (job.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Job must be in progress to complete' });
    }

    job.status = 'completed';
    job.completedAt = Date.now();
    await job.save();

    if (job.assignedWorkers?.length) {
      await WorkerProfile.updateMany(
        { userId: { $in: job.assignedWorkers } },
        { $inc: { completedJobs: 1 } }
      );
    }

    res.json({ success: true, message: 'Job marked as completed', data: job });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
  getMyApplications,
  completeJob
};
