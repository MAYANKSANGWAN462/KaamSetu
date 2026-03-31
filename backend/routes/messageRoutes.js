const express = require('express');
const router = express.Router();
const { 
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes require authentication
router.use(protect);

// Routes
router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/:userId', getConversation);
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;