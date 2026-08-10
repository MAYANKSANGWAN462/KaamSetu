const express = require('express');
const router = express.Router();
const {
  logPayment,
  confirmPayment,
  getMyPayments,
  getJobPayments,
  getApplicationPayment
} = require('../controllers/paymentController');
const { protect, requireMode } = require('../middleware/authMiddleware');

router.use(protect);

// Static routes first
router.get('/mine', getMyPayments);

// Hirer routes
router.post('/', requireMode('hirer'), logPayment);
router.get('/job/:jobId', requireMode('hirer'), getJobPayments);

// Shared — hirer or worker can check
router.get('/application/:applicationId', getApplicationPayment);

// Worker confirms receipt
router.put('/:id/confirm', requireMode('worker'), confirmPayment);

module.exports = router;
