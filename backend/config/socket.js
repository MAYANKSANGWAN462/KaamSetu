// Socket.io configuration for real-time chat
let io;

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
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Online users tracking
const onlineUsers = new Map();

const handleSocketConnection = (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} joined room`);
      io.emit('userOnline', { userId, online: true });
    }
  });

  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, message, messageId } = data;
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverId).emit('receiveMessage', {
        messageId,
        senderId,
        message,
        createdAt: new Date(),
        read: false
      });
    }
    socket.emit('messageSent', { messageId, success: true });
  });

  socket.on('markRead', ({ messageId, senderId }) => {
    io.to(senderId).emit('messageRead', { messageId });
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    io.to(receiverId).emit('userTyping', { userId: socket.id, isTyping });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      console.log(`📴 User ${disconnectedUserId} disconnected`);
      io.emit('userOnline', { userId: disconnectedUserId, online: false });
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
};

module.exports = { initSocket, getIo, handleSocketConnection, onlineUsers };