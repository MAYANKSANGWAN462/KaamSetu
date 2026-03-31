const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const translationRoutes = require('./routes/translationRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const { initSocket, handleSocketConnection } = require('./config/socket');
const connectDB = require('./config/database');

const app = express();

/* ===================== MIDDLEWARE ===================== */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

/* ===================== ROUTES ===================== */

// Root test route
app.get("/", (req, res) => {
  res.send("Backend working");
});

// Health check (for Render)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Sambandh API is running',
    timestamp: new Date()
  });
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Sambandh API is working!',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/google',
      '/api/auth/profile',
      '/api/workers',
      '/api/jobs'
    ]
  });
});

/* ===================== API ROUTES ===================== */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/translate', translationRoutes);

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

connectDB()
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📁 Database: ${mongoose.connection.name}`);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Sambandh server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ===================== GRACEFUL SHUTDOWN ===================== */

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});