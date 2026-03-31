const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = Date.now();
    await this.save();
  }
  return this;
};

// Method to delete for user
messageSchema.methods.deleteForUser = async function(userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    await this.save();
  }
  return this;
};

// Static method to get conversation
messageSchema.statics.getConversation = async function(user1Id, user2Id, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { senderId: user1Id, receiverId: user2Id },
      { senderId: user2Id, receiverId: user1Id }
    ],
    deletedBy: { $nin: [user1Id] }
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('senderId', 'name profileImage')
  .populate('receiverId', 'name profileImage');
};

module.exports = mongoose.model('Message', messageSchema);