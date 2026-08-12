const express = require('express');
const router = express.Router();
const {
  logPayment,
  createOrder,
  verifyPayment,
  handleWebhook,
  confirmPayment,
  getMyPayments,
  getJobPayments,
  getApplicationPayment
} = require('../controllers/paymentController');
const { protect, requireMode } = require('../middleware/authMiddleware');

// ── Razorpay webhook — raw body required, no auth ──────────
// Must be registered BEFORE body-parser JSON middleware in server.js
// (handled via express.raw in server.js or here as raw endpoint)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Parse the raw body back to JSON for the handler
  try {
    req.body = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next();
}, handleWebhook);

// ── All routes below require authentication ──────────────
router.use(protect);

router.get('/mine', getMyPayments);
router.get('/job/:jobId', requireMode('hirer'), getJobPayments);
router.get('/application/:applicationId', getApplicationPayment);

// Cash payment
router.post('/', requireMode('hirer'), logPayment);

// Online payment (Razorpay)
router.post('/create-order', requireMode('hirer'), createOrder);
router.post('/verify', requireMode('hirer'), verifyPayment);

// Worker confirms cash receipt
router.put('/:id/confirm', requireMode('worker'), confirmPayment);

module.exports = router;
