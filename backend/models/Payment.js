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
      enum: ['cash'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['logged_by_hirer', 'confirmed_by_worker', 'disputed'],
      default: 'logged_by_hirer'
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: ''
    },
    workerConfirmedAt: {
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

module.exports = mongoose.model('Payment', paymentSchema);
