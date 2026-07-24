const Message = require('../models/Message');
const User = require('../models/User');
const { makeConversationId } = require('../utils/conversationId');
const { hasInteraction } = require('../utils/interaction');

/* ─── POST /api/messages ─────────────────────────────────── */

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const text = String(content || '').trim();

    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and content are required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 5000 characters'
      });
    }

    // Role rule: a user can never message themselves.
    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot message yourself'
      });
    }

    const receiver = await User.findById(receiverId).lean();
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // Core guard — any Application record required
    const allowed = await hasInteraction(req.user._id, receiverId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you have a job interaction with'
      });
    }

    const conversationId = makeConversationId(req.user._id, receiverId);

    const msg = await Message.create({
      conversationId,
      senderId: req.user._id,
      receiverId,
      content: text,
      isRead: false
    });

    const populated = await Message.findById(msg._id)
      .populate('senderId', 'name profilePhoto')
      .populate('receiverId', 'name profilePhoto')
      .lean();

    // Emit via socket
    try {
      const { getIo } = require('../config/socket');
      const io = getIo();
      io.to(conversationId).emit('receiveMessage', {
        conversationId,
        messageId: populated._id,
        senderId: req.user._id.toString(),
        receiverId: receiverId.toString(),
        content: populated.content,
        createdAt: populated.createdAt,
        isRead: false
      });
      // Notify the receiver's personal room so the bell/unread badge updates
      // even when they are not currently viewing this conversation.
      io.to(receiverId.toString()).emit('newMessage', {
        conversationId,
        senderId: req.user._id.toString(),
        senderName: req.user.name,
        preview: populated.content.slice(0, 120),
        createdAt: populated.createdAt
      });
    } catch (socketErr) {
      console.warn('[sendMessage] Socket emit skipped:', socketErr.message);
    }

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('[sendMessage]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/messages/:conversationId ──────────────────── */

const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Derive the other userId from conversationId
    const parts = conversationId.split('_');
    if (parts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversationId format'
      });
    }

    const myId = req.user._id.toString();
    // The requester MUST be one of the two participants encoded in the id —
    // otherwise a user could read a conversation between two other people by
    // guessing/constructing their conversationId. Mirrors the socket-layer guard.
    if (!parts.includes(myId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this conversation'
      });
    }
    const otherId = parts[0] === myId ? parts[1] : parts[0];

    const allowed = await hasInteraction(req.user._id, otherId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this conversation'
      });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const messages = await Message.getConversation(
      req.user._id,
      otherId,
      conversationId,
      parseInt(limit, 10),
      skip
    );

    // Mark received messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: otherId,
        receiverId: req.user._id,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        page: parseInt(page, 10),
        hasMore: messages.length === parseInt(limit, 10)
      }
    });
  } catch (error) {
    console.error('[getConversation]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/messages/conversations ────────────────────── */

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user._id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          conversationId: { $first: '$conversationId' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const [otherUser, allowed] = await Promise.all([
          User.findById(conv._id).select('name profilePhoto').lean(),
          hasInteraction(req.user._id, conv._id)
        ]);

        if (!allowed) return null;

        return {
          conversationId: makeConversationId(req.user._id, conv._id),
          otherUserId: conv._id,
          name: otherUser?.name || 'Unknown',
          profilePhoto: otherUser?.profilePhoto || '',
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    return res.json({
      success: true,
      data: populated.filter(Boolean)
    });
  } catch (error) {
    console.error('[getConversations]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── GET /api/messages/unread/count ─────────────────────── */

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });
    return res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    console.error('[getUnreadCount]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─── DELETE /api/messages/:messageId ────────────────────── */

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const myId = req.user._id.toString();
    if (
      message.senderId.toString() !== myId &&
      message.receiverId.toString() !== myId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await message.deleteOne();
    return res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('[deleteMessage]', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  deleteMessage
};