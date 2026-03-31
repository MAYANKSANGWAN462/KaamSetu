// Purpose: Handles messaging flows restricted to accepted worker-hirer relationships.
const Message = require('../models/Message');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');

const canUsersMessage = async (userAId, userBId) => {
  const userA = userAId.toString();
  const userB = userBId.toString();

  const acceptedApplications = await Application.find({
    status: 'accepted',
    $or: [{ workerId: userA }, { workerId: userB }]
  })
    .select('jobId workerId')
    .lean();

  if (!acceptedApplications.length) return false;

  const jobIds = acceptedApplications.map((application) => application.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } }).select('_id createdBy').lean();
  const hirerByJobId = new Map(jobs.map((job) => [job._id.toString(), job.createdBy.toString()]));

  return acceptedApplications.some((application) => {
    const workerId = application.workerId.toString();
    const hirerId = hirerByJobId.get(application.jobId.toString());
    if (!hirerId) return false;
    return (workerId === userA && hirerId === userB) || (workerId === userB && hirerId === userA);
  });
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message cannot exceed 2000 characters' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const allowed = await canUsersMessage(req.user._id, receiverId);
    if (!allowed) {
      return res.status(403).json({ message: 'Messaging is enabled only after hiring acceptance' });
    }
    
    // Create message
    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message
    });
    
    // Populate sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const allowed = await canUsersMessage(req.user._id, req.params.userId);
    if (!allowed) {
      return res.status(403).json({ message: 'Conversation is available only for accepted worker-hirer matches' });
    }
    
    const messages = await Message.getConversation(
      req.user._id,
      req.params.userId,
      parseInt(limit),
      skip
    );
    
    // Mark unread messages as read
    await Message.updateMany(
      {
        senderId: req.params.userId,
        receiverId: req.user._id,
        read: false
      },
      { read: true, readAt: Date.now() }
    );
    
    res.json({
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Get all unique users that current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ],
          deletedBy: { $nin: [req.user._id] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user._id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiverId', req.user._id] },
                  { $eq: ['$read', false] }
                ] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('name email profileImage');
        const allowed = await canUsersMessage(req.user._id, conv._id);
        return {
          userId: conv._id,
          name: user?.name || 'Unknown User',
          profileImage: user?.profileImage || '',
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount,
          allowed
        };
      })
    );

    res.json(populatedConversations.filter((conversation) => conversation.allowed));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await message.markAsRead();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.senderId.toString() !== req.user._id.toString() && 
        message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await message.deleteForUser(req.user._id);
    
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
      deletedBy: { $nin: [req.user._id] }
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount
};