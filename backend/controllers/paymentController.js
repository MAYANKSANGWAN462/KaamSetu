const crypto = require('crypto');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { getIo } = require('../config/socket');
const { getRazorpay } = require('../config/razorpay');

/* ─── helpers ─────────────────────────────────────────────── */

// Verify the requester is the hirer for this application (or admin)
function assertHirerOrAdmin(application, user) {
  if (user.role === 'admin') return true;
  return application.hirerId.toString() === user._id.toString();
}

// Validate that the job is completed and application is accepted before any payment
async function assertPaymentReady(application) {
  if (application.status !== 'accepted') {
    return 'Payment can only be logged for accepted applications';
  }
  const job = await Job.findById(application.jobId).lean();
  if (!job) return 'Associated job not found';
  if (job.status !== 'completed') {
    return 'Payment can only be logged after the job is marked complete';
  }
  return null; // OK
}

/* ─── POST /api/payments ──────────────────────────────────── */
// Hirer logs a CASH payment after job is completed

const logPayment = async (req, res) => {
  try {
    const { applicationId, amount, note } = req.body;

    if (!applicationId || amount == null) {
      return res.status(400).json({ success: false, message: 'applicationId and amount are required' });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'amount must be a non-negative number' });
    }

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (!assertHirerOrAdmin(application, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const readyError = await assertPaymentReady(application);
    if (readyError) return res.status(400).json({ success: false, message: readyError });

    const existing = await Payment.findOne({ applicationId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Payment already logged for this application', data: existing });
    }

    const payment = await Payment.create({
      jobId: application.jobId,
      applicationId,
      hirerId: application.hirerId,
      workerId: application.workerId,
      amount: amountNum,
      method: 'cash',
      status: 'logged_by_hirer',
      note: String(note || '').trim().slice(0, 300)
    });

    try {
      const io = getIo();
      io.to(application.workerId.toString()).emit('paymentLogged', {
        paymentId: payment._id.toString(),
        applicationId: applicationId,
        jobId: application.jobId.toString(),
        amount: payment.amount,
        method: 'cash'
      });
    } catch (socketErr) {
      console.warn('[logPayment] Socket emit skipped:', socketErr.message);
    }

    return res.status(201).json({ success: true, message: 'Cash payment logged successfully', data: payment });
  } catch (error) {
    console.error('[logPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── POST /api/payments/create-order ─────────────────────── */
// Hirer initiates an ONLINE payment — creates a Razorpay order

const createOrder = async (req, res) => {
  try {
    const { applicationId, amount, note } = req.body;

    if (!applicationId || amount == null) {
      return res.status(400).json({ success: false, message: 'applicationId and amount are required' });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (!assertHirerOrAdmin(application, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const readyError = await assertPaymentReady(application);
    if (readyError) return res.status(400).json({ success: false, message: readyError });

    // Check if a payment already exists (including pending online)
    const existing = await Payment.findOne({ applicationId });
    if (existing) {
      // If the previous order was abandoned (still pending), reuse it
      if (existing.status === 'pending_online' && existing.razorpayOrderId) {
        return res.json({
          success: true,
          message: 'Existing pending order returned',
          data: {
            orderId: existing.razorpayOrderId,
            amount: existing.amount * 100, // paise
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
            paymentId: existing._id.toString()
          }
        });
      }
      return res.status(409).json({ success: false, message: 'Payment already logged for this application', data: existing });
    }

    // Amount in paise (Razorpay requires smallest currency unit)
    const amountPaise = Math.round(amountNum * 100);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `app_${applicationId.toString().slice(-8)}_${Date.now()}`,
      notes: {
        applicationId: applicationId.toString(),
        jobId: application.jobId.toString(),
        hirerId: application.hirerId.toString(),
        workerId: application.workerId.toString()
      }
    });

    // Save a pending payment record so we can verify later
    const payment = await Payment.create({
      jobId: application.jobId,
      applicationId,
      hirerId: application.hirerId,
      workerId: application.workerId,
      amount: amountNum,
      method: 'online',
      status: 'pending_online',
      note: String(note || '').trim().slice(0, 300),
      razorpayOrderId: order.id
    });

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created',
      data: {
        orderId: order.id,
        amount: amountPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id.toString()
      }
    });
  } catch (error) {
    console.error('[createOrder]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── POST /api/payments/verify ──────────────────────────── */
// Frontend calls this after Razorpay checkout completes —
// verifies HMAC signature and marks payment as paid.

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return res.status(400).json({ success: false, message: 'razorpay_order_id, razorpay_payment_id, razorpay_signature, and applicationId are required' });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    const payment = await Payment.findOne({ applicationId, razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status === 'paid_online') {
      return res.json({ success: true, message: 'Payment already verified', data: payment });
    }

    // Optionally fetch detailed payment info from Razorpay to get onlineMethod
    let onlineMethod = null;
    try {
      const razorpay = getRazorpay();
      const rpPayment = await razorpay.payments.fetch(razorpay_payment_id);
      onlineMethod = rpPayment.method || null; // 'upi', 'card', 'netbanking', 'wallet'
    } catch {
      // Non-fatal — method enrichment is optional
    }

    payment.status = 'paid_online';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.onlineMethod = onlineMethod;
    payment.paidAt = new Date();
    await payment.save();

    // Notify both parties via socket
    try {
      const io = getIo();
      io.to(payment.workerId.toString()).emit('paymentLogged', {
        paymentId: payment._id.toString(),
        applicationId: applicationId,
        jobId: payment.jobId.toString(),
        amount: payment.amount,
        method: 'online',
        status: 'paid_online'
      });
      io.to(payment.hirerId.toString()).emit('paymentConfirmed', {
        paymentId: payment._id.toString(),
        applicationId: applicationId,
        jobId: payment.jobId.toString(),
        amount: payment.amount,
        method: 'online'
      });
    } catch (socketErr) {
      console.warn('[verifyPayment] Socket emit skipped:', socketErr.message);
    }

    return res.json({ success: true, message: 'Payment verified and confirmed', data: payment });
  } catch (error) {
    console.error('[verifyPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── POST /api/payments/webhook ─────────────────────────── */
// Razorpay webhook — handles async payment events as a fallback

const handleWebhook = (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!secret || !signature) {
      return res.status(400).json({ success: false, message: 'Webhook secret or signature missing' });
    }

    // Must verify against the raw request bytes, not re-serialized JSON
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const orderId = payload.order_id;
      // Find and update the payment record asynchronously
      Payment.findOne({ razorpayOrderId: orderId }).then(async (payment) => {
        if (payment && payment.status === 'pending_online') {
          payment.status = 'paid_online';
          payment.razorpayPaymentId = payload.id;
          payment.onlineMethod = payload.method;
          payment.paidAt = new Date();
          await payment.save();

          try {
            const io = getIo();
            io.to(payment.workerId.toString()).emit('paymentLogged', {
              paymentId: payment._id.toString(),
              applicationId: payment.applicationId.toString(),
              jobId: payment.jobId.toString(),
              amount: payment.amount,
              method: 'online',
              status: 'paid_online'
            });
          } catch {}
        }
      }).catch(err => console.error('[webhook] DB update failed:', err.message));
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[handleWebhook]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── PUT /api/payments/:id/confirm ──────────────────────── */
// Worker confirms they received a CASH payment

const confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (req.user.role !== 'admin' && payment.workerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (payment.method !== 'cash') {
      return res.status(400).json({ success: false, message: 'Only cash payments need manual worker confirmation' });
    }

    if (payment.status !== 'logged_by_hirer') {
      return res.status(400).json({ success: false, message: 'Payment is already confirmed or disputed' });
    }

    payment.status = 'confirmed_by_worker';
    payment.workerConfirmedAt = new Date();
    await payment.save();

    try {
      const io = getIo();
      io.to(payment.hirerId.toString()).emit('paymentConfirmed', {
        paymentId: payment._id.toString(),
        applicationId: payment.applicationId.toString(),
        jobId: payment.jobId.toString(),
        amount: payment.amount,
        method: 'cash'
      });
    } catch (socketErr) {
      console.warn('[confirmPayment] Socket emit skipped:', socketErr.message);
    }

    return res.json({ success: true, message: 'Payment confirmed. Thank you!', data: payment });
  } catch (error) {
    console.error('[confirmPayment]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/payments/mine ──────────────────────────────── */

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

const getJobPayments = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
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

const getApplicationPayment = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).lean();
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

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
  createOrder,
  verifyPayment,
  handleWebhook,
  confirmPayment,
  getMyPayments,
  getJobPayments,
  getApplicationPayment
};
