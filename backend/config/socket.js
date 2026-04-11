let io;

const onlineUsers = new Map();

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });
  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const handleSocketConnection = (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(userId);
    onlineUsers.set(String(userId), socket.id);
    io.emit('userOnline', { userId, online: true });
  });

  socket.on('joinConversation', (conversationId) => {
    if (conversationId && typeof conversationId === 'string') {
      socket.join(conversationId);
    }
  });

  socket.on('leaveConversation', (conversationId) => {
    if (conversationId && typeof conversationId === 'string') {
      socket.leave(conversationId);
    }
  });

  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message, messageId } = data;
    if (!receiverId || !senderId) return;
    io.to(String(receiverId)).emit('receiveMessage', {
      messageId,
      senderId,
      message,
      createdAt: new Date(),
      isRead: false
    });
    socket.emit('messageSent', { messageId, success: true });
  });

  socket.on('markRead', ({ messageId, senderId }) => {
    if (senderId) io.to(String(senderId)).emit('messageRead', { messageId });
  });

  socket.on('typing', ({ receiverId, senderId, isTyping }) => {
    if (!receiverId || !senderId) return;
    io.to(String(receiverId)).emit('userTyping', {
      userId: senderId,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('userOnline', { userId: disconnectedUserId, online: false });
    }
  });
};

module.exports = { initSocket, getIo, handleSocketConnection, onlineUsers };