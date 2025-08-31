require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Import routes
const studentRoutes = require("./routes/student");
const gradesRoutes = require("./routes/grade");
const classesRoutes = require("./routes/class");
const subjectsRoutes = require("./routes/subject");
const lessonsRoutes = require("./routes/lesson");
const examsRoutes = require("./routes/exam");
const assignmentsRoutes = require("./routes/assignment");
const resultsRoutes = require("./routes/result");
const attendanceRoutes = require("./routes/attendance");
const eventsRoutes = require("./routes/event");
const announcementsRoutes = require("./routes/announcement");
const teacherRoutes = require("./routes/teacher");
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 100000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs, previously 10
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'https://scholio-yash-rajvanshis-projects.vercel.app',
    'https://scholio.vercel.app',
    // 'https://backend-dashboard-l273.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 6969;

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to School Dashboard API!",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/grade", gradesRoutes);
app.use("/api/class", classesRoutes);
app.use("/api/subject", subjectsRoutes);
app.use("/api/lesson", lessonsRoutes);
app.use("/api/exam", examsRoutes);
app.use("/api/assignment", assignmentsRoutes);
app.use("/api/result", resultsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/event", eventsRoutes);
app.use("/api/announcement", announcementsRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Error',
      message: 'A record with this information already exists'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'The provided token has expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

