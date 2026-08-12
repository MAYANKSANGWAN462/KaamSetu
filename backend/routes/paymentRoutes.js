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

// ── Razorpay webhook — no auth; rawBody is saved by express.json verify in server.js ──
router.post('/webhook', handleWebhook);

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
