const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_COOKIE_NAME } = require('../utils/generateToken');

let io;

const onlineUsers = new Map();

/* ─── Handshake token extraction ─────────────────────────────
 * Prefer the explicit auth payload sent by the client, then fall
 * back to the httpOnly cookie forwarded on the websocket handshake.
 */
function extractHandshakeToken(socket) {
  const fromAuth = socket.handshake?.auth?.token;
  if (fromAuth) return String(fromAuth).replace(/^Bearer\s+/i, '');

  const authHeader = socket.handshake?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  const cookieHeader = socket.handshake?.headers?.cookie;
  if (cookieHeader) {
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${JWT_COOKIE_NAME}=`));
    if (match) return decodeURIComponent(match.split('=')[1]);
  }
  return null;
}

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

  // ── Authenticate every handshake — no anonymous sockets ──
  io.use(async (socket, next) => {
    try {
      const token = extractHandshakeToken(socket);
      if (!token) return next(new Error('Not authorized, no token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name isActive').lean();
      if (!user || user.isActive === false) {
        return next(new Error('Not authorized'));
      }

      // Identity is derived from the verified token — never from client fields.
      socket.user = { _id: String(user._id), name: user.name };
      next();
    } catch (err) {
      next(new Error('Not authorized'));
    }
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const handleSocketConnection = (socket) => {
  const userId = socket.user?._id;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  // Always join the authenticated user's personal room — ignore client input.
  socket.join(userId);
  onlineUsers.set(userId, socket.id);
  io.emit('userOnline', { userId, online: true });

  socket.on('joinConversation', (conversationId) => {
    // Only allow joining a conversation the authenticated user is part of.
    if (typeof conversationId === 'string' && conversationId.split('_').includes(userId)) {
      socket.join(conversationId);
    }
  });

  socket.on('leaveConversation', (conversationId) => {
    if (conversationId && typeof conversationId === 'string') {
      socket.leave(conversationId);
    }
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    if (!receiverId) return;
    // senderId is the verified identity, never a client-supplied field.
    io.to(String(receiverId)).emit('userTyping', {
      userId,
      isTyping: Boolean(isTyping)
    });
  });

  socket.on('markRead', ({ messageId, senderId }) => {
    if (senderId) io.to(String(senderId)).emit('messageRead', { messageId });
  });

  socket.on('disconnect', () => {
    if (onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
      io.emit('userOnline', { userId, online: false });
    }
  });
};

module.exports = { initSocket, getIo, handleSocketConnection, onlineUsers };
