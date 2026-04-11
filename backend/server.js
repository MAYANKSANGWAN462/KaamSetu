const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
// const translationRoutes = require('./routes/translationRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const { initSocket, handleSocketConnection } = require('./config/socket');
const connectDB = require('./config/database');

const app = express();
app.set('trust proxy', 1);

/* ===================== RATE LIMITERS ===================== */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many registrations. Try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

/* ===================== MIDDLEWARE ===================== */

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(compression());
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/* ===================== HEALTH ROUTES ===================== */

app.get('/', (req, res) => {
  res.json({ success: true, message: 'KaamSetu API is running' });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'KaamSetu API is running',
    timestamp: new Date()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'KaamSetu API is working!',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/google',
      '/api/auth/me',
      '/api/auth/mode',
      '/api/workers',
      '/api/jobs',
      '/api/applications',
      '/api/messages'
    ]
  });
});

/* ===================== API ROUTES ===================== */

// Auth routes with specific rate limits on sensitive endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
// app.use('/api/translate', translationRoutes);

/* ===================== ERROR HANDLING ===================== */

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorMiddleware);

/* ===================== SERVER + SOCKET ===================== */

const server = http.createServer(app);
const io = initSocket(server);
io.on('connection', handleSocketConnection);

/* ===================== DATABASE + START ===================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 KaamSetu server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

/* ===================== GRACEFUL SHUTDOWN ===================== */

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});