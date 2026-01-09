require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { startReminderCron } = require('./cron/reminderCron');

const authRoutes = require('./routes/authRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const taskRoutes = require('./routes/taskRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const judgeRoutes = require('./routes/judgeRoutes');

const app = express();

/* -------------------- DB CONNECTION -------------------- */
connectDB();

/* -------------------- CORS CONFIGURATION (STRICT) -------------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://hackathon-management-system-chi.vercel.app',
  'https://hackathon-management-system-kalaimathis-projects.vercel.app'
];

// Add FRONTEND_URL from env if it exists and is different
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }
}

console.log('🔐 CORS Configuration:');
console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌍 Incoming request from origin:', origin || 'NO ORIGIN');
    
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      console.log('✅ Allowed: No origin header');
      return callback(null, true);
    }

    // Remove trailing slash from origin
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed) {
      console.log('✅ CORS ALLOWED for:', normalizedOrigin);
      callback(null, true);
    } else {
      console.log('❌ CORS BLOCKED for:', normalizedOrigin);
      console.log('   Allowed origins are:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight for all routes
app.options('*', cors(corsOptions));

/* -------------------- BODY PARSER -------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* -------------------- REQUEST LOGGER -------------------- */
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.headers.origin || 'NO ORIGIN'}`);
  console.log(`   Headers:`, {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none'
  });
  next();
});

/* -------------------- RATE LIMITING -------------------- */
app.use('/api', apiLimiter);

/* -------------------- API ROUTES -------------------- */
console.log('📍 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/judge', judgeRoutes);
console.log('✅ All routes registered');

/* -------------------- ROOT ENDPOINT -------------------- */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Hackathon Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      hackathons: '/api/hackathons/*',
      tasks: '/api/tasks/*',
      assignments: '/api/assignments/*',
      submissions: '/api/submissions/*',
      judge: '/api/judge/*'
    }
  });
});

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins: allowedOrigins,
      frontendUrl: process.env.FRONTEND_URL
    },
    database: 'connected'
  });
});

/* -------------------- TEST ENDPOINT FOR DEBUGGING -------------------- */
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res, next) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    hint: 'Check if the route exists and the HTTP method is correct'
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error('🔴 ERROR:', err.message);
  console.error('Stack:', err.stack);

  if (err.message.includes('CORS') || err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy error',
      details: 'This origin is not allowed to access the API',
      allowedOrigins: allowedOrigins
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
  console.log(`🔐 JWT: ${process.env.JWT_ACCESS_SECRET ? '✅' : '❌'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? '✅' : '❌'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
  console.log('✅ Allowed CORS origins:');
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('═══════════════════════════════════════════════════════');

  // Start cron job
  try {
    startReminderCron();
    console.log('⏰ Reminder cron started');
  } catch (error) {
    console.error('❌ Cron job failed:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;