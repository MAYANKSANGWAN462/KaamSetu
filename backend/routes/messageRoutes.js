const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes require authentication
router.use(protect);

// Static routes — must be before dynamic /:conversationId
router.get('/conversations',  getConversations);
router.get('/unread/count',   getUnreadCount);
router.post('/',              sendMessage);

// Dynamic routes
router.get('/:conversationId',    getConversation);
router.delete('/:messageId',      deleteMessage);

module.exports = router;