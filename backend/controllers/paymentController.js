const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { getIo } = require('../config/socket');

/* ─── POST /api/payments ──────────────────────────────────── */
// Hirer logs a cash payment after job is completed

const logPayment = async (req, res) => {
  try {
    const { applicationId, amount, note } = req.body;

    if (!applicationId || amount == null) {
      return res.status(400).json({
        success: false,
        message: 'applicationId and amount are required'
      });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'amount must be a non-negative number' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.hirerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be logged for accepted applications'
      });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Associated job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be logged after the job is marked complete'
      });
    }

    const existing = await Payment.findOne({ applicationId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Payment already logged for this application',
        data: existing
      });
    }

    const payment = await Payment.create({
      jobId: application.jobId,
      applicationId,
      hirerId: req.user._id,
      workerId: application.workerId,
      amount: amountNum,
      note: String(note || '').trim().slice(0, 300)
    });

    try {
      const io = getIo();
      io.to(application.workerId.toString()).emit('paymentLogged', {
        paymentId: payment._id.toString(),
        jobId: application.jobId.toString(),
        amount: payment.amount,
        jobTitle: job.title
      });
    } catch (socketErr) {
      console.warn('[logPayment] Socket emit skipped:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Payment logged successfully',
      data: payment
    });
  } catch (error) {
    console.error('[logPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PUT /api/payments/:id/confirm ──────────────────────── */
// Worker confirms they received the cash payment

const confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.workerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (payment.status !== 'logged_by_hirer') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already confirmed or disputed'
      });
    }

    payment.status = 'confirmed_by_worker';
    payment.workerConfirmedAt = new Date();
    await payment.save();

    try {
      const io = getIo();
      io.to(payment.hirerId.toString()).emit('paymentConfirmed', {
        paymentId: payment._id.toString(),
        jobId: payment.jobId.toString(),
        amount: payment.amount
      });
    } catch (socketErr) {
      console.warn('[confirmPayment] Socket emit skipped:', socketErr.message);
    }

    return res.json({
      success: true,
      message: 'Payment confirmed. Thank you!',
      data: payment
    });
  } catch (error) {
    console.error('[confirmPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/payments/mine ──────────────────────────────── */
// Hirer or worker sees their own payment history

const getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const mode = req.user.activeMode;

    const query = mode === 'hirer' ? { hirerId: userId } : { workerId: userId };

    const payments = await Payment.find(query)
      .populate('jobId', 'title wage location')
      .populate('hirerId', 'name profilePhoto')
      .populate('workerId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('[getMyPayments]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/payments/job/:jobId ───────────────────────── */
// Hirer sees all payments logged for a specific job

const getJobPayments = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.hirerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const payments = await Payment.find({ jobId: req.params.jobId })
      .populate('workerId', 'name profilePhoto')
      .lean();

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('[getJobPayments]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/payments/application/:applicationId ───────── */
// Hirer or worker checks payment status for a specific application

const getApplicationPayment = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).lean();
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const userId = req.user._id.toString();
    if (
      application.hirerId.toString() !== userId &&
      application.workerId.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const payment = await Payment.findOne({ applicationId: req.params.applicationId })
      .populate('hirerId', 'name')
      .populate('workerId', 'name')
      .lean();

    return res.json({ success: true, data: payment || null });
  } catch (error) {
    console.error('[getApplicationPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  logPayment,
  confirmPayment,
  getMyPayments,
  getJobPayments,
  getApplicationPayment
};
