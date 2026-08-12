const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'jobId is required']
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'applicationId is required']
    },
    hirerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'hirerId is required']
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'workerId is required']
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    method: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash'
    },
    // 'online' sub-method returned by Razorpay after payment (upi, card, netbanking, wallet)
    onlineMethod: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: [
        'pending_online',     // Razorpay order created, payment not yet done
        'logged_by_hirer',    // Cash: hirer recorded payment
        'confirmed_by_worker',// Cash: worker confirmed receipt
        'paid_online',        // Online: Razorpay payment verified
        'disputed'            // Either method: under dispute
      ],
      default: 'logged_by_hirer'
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: ''
    },
    // Cash-specific
    workerConfirmedAt: {
      type: Date,
      default: null
    },
    // Razorpay-specific
    razorpayOrderId: {
      type: String,
      default: null
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

paymentSchema.index({ jobId: 1 });
paymentSchema.index({ hirerId: 1, createdAt: -1 });
paymentSchema.index({ workerId: 1, createdAt: -1 });
paymentSchema.index({ applicationId: 1 }, { unique: true });
paymentSchema.index({ razorpayOrderId: 1 }, { sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
