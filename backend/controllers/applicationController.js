const Application = require("../models/Application");
const Job = require("../models/Job");
const WorkerProfile = require("../models/WorkerProfile");
const User = require("../models/User");
const { makeConversationId } = require("../utils/conversationId");
const { getIo } = require("../config/socket");

/* ─── POST /api/applications ─────────────────────────────── */
// Worker applies to a job

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "jobId is required" });
    }

    const workerProfile = await WorkerProfile.findOne({
      userId: req.user._id,
    }).lean();
    // Worker profile is optional — allow applying without one

    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    if (job.hirerId && job.hirerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job posting",
      });
    }

    const existing = await Application.findOne({
      jobId,
      workerId: req.user._id,
    }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      jobId,
      workerId: req.user._id,
      hirerId: job.hirerId,
      status: "pending",
    });

    // Notify hirer via socket
    try {
      const io = getIo();
      io.to(job.hirerId.toString()).emit("newApplication", {
        jobId: job._id.toString(),
        jobTitle: job.title,
        workerId: req.user._id.toString(),
        workerName: req.user.name,
        applicationId: application._id.toString(),
        message: "A worker has applied for your job",
      });
    } catch (socketErr) {
      console.warn("[applyToJob] Socket emit skipped:", socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("[applyToJob]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ─── POST /api/applications/contact ─────────────────────── */
// Hirer contacts a worker directly (no job) — creates interaction

const contactWorker = async (req, res) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res
        .status(400)
        .json({ success: false, message: "workerId is required" });
    }

    const worker = await User.findById(workerId).lean();
    if (!worker) {
      return res
        .status(404)
        .json({ success: false, message: "Worker not found" });
    }

    if (workerId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot contact yourself",
      });
    }

    // Check if interaction already exists
    const existing = await Application.findOne({
      workerId,
      hirerId: req.user._id,
      jobId: null,
    }).lean();

    if (existing) {
      return res.json({
        success: true,
        message: "Interaction already exists",
        data: {
          application: existing,
          conversationId: makeConversationId(req.user._id, workerId),
        },
      });
    }

    const application = await Application.create({
      jobId: null,
      workerId,
      hirerId: req.user._id,
      status: "pending",
    });

    // Notify worker via socket
    try {
      const io = getIo();
      io.to(workerId.toString()).emit("hirerContact", {
        hirerId: req.user._id.toString(),
        applicationId: application._id.toString(),
        message: "A hirer wants to connect with you",
      });
    } catch (socketErr) {
      console.warn("[contactWorker] Socket emit skipped:", socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Contact request sent",
      data: {
        application,
        conversationId: makeConversationId(req.user._id, workerId),
      },
    });
  } catch (error) {
    console.error("[contactWorker]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ─── GET /api/applications/mine ─────────────────────────── */
// Worker sees their own applications

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user._id })
      .populate("jobId", "title description wage location status hirerId")
      .populate("hirerId", "name profilePhoto")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: applications });
  } catch (error) {
    console.error("[getMyApplications]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ─── GET /api/applications/job/:jobId ───────────────────── */
// Hirer sees applicants for their job

const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (
      job.hirerId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applicants for this job",
      });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate("workerId", "name email phone profilePhoto")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with worker profiles
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const workerProfile = app.workerId
          ? await WorkerProfile.findOne({ userId: app.workerId._id })
              .select("category skills wage rating isAvailable")
              .lean()
          : null;
        return { ...app, workerProfile };
      }),
    );

    return res.json({ success: true, data: enriched });
  } catch (error) {
    console.error("[getJobApplicants]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ─── GET /api/applications/check ────────────────────────── */
// Check if interaction exists — used by frontend to show Message button

const checkInteraction = async (req, res) => {
  try {
    const { jobId, workerId } = req.query;

    if (!jobId && !workerId) {
      return res.status(400).json({
        success: false,
        message: "Provide jobId or workerId as query parameter",
      });
    }

    let query;
    if (jobId) {
      // Worker checking if they applied to a job
      query = { jobId, workerId: req.user._id };
    } else {
      // Hirer checking if they have interacted with a worker
      query = {
        workerId,
        hirerId: req.user._id,
      };
    }

    const interaction = await Application.findOne(query).lean();

    return res.json({
      success: true,
      data: {
        hasInteraction: Boolean(interaction),
        application: interaction || null,
        conversationId: interaction
          ? makeConversationId(
              req.user._id,
              jobId ? interaction.hirerId : workerId,
            )
          : null,
      },
    });
  } catch (error) {
    console.error("[checkInteraction]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/* ─── PUT /api/applications/:id ──────────────────────────── */
// Hirer accepts or rejects an application

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "accepted" or "rejected"',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.hirerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    if (status === "accepted" && application.jobId) {
      const job = await Job.findById(application.jobId);
      if (!job) {
        return res
          .status(404)
          .json({ success: false, message: "Associated job not found" });
      }

      const acceptedCount = await Application.countDocuments({
        jobId: application.jobId,
        status: "accepted",
      });

      if (acceptedCount >= job.workersRequired) {
        return res.status(400).json({
          success: false,
          message: `This job only needs ${job.workersRequired} worker(s) and that quota is already filled`,
        });
      }

      application.status = "accepted";
      const newCount = acceptedCount + 1;
      if (newCount >= job.workersRequired) {
        job.status = "filled";
        await job.save();
      }
    } else {
      application.status = status;
    }

    await application.save();

    // Notify worker via socket
    try {
      const io = getIo();
      io.to(application.workerId.toString()).emit("applicationStatusUpdate", {
        applicationId: application._id.toString(),
        status: application.status,
        jobId: application.jobId?.toString(),
      });
    } catch (socketErr) {
      console.warn(
        "[updateApplicationStatus] Socket emit skipped:",
        socketErr.message,
      );
    }

    return res.json({
      success: true,
      message: `Application ${status}`,
      data: application,
    });
  } catch (error) {
    console.error("[updateApplicationStatus]", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  applyToJob,
  contactWorker,
  getMyApplications,
  getJobApplicants,
  checkInteraction,
  updateApplicationStatus,
};
