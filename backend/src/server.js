import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import usersRoutes from './routes/users.routes.js';
import auditRoutes from './routes/audit.routes.js';
import terapisRoutes from './routes/terapis.routes.js';
import requirementRoutes from './routes/requirement.routes.js';
import tnaRoutes from './routes/tna.routes.js';
import evaluasiRoutes from './routes/evaluasi.routes.js';
import trainingRoutes from './routes/training.routes.js';
import statisticsRoutes from './routes/statistics.routes.js';
import { auditLog } from './middleware/audit.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - allow all localhost ports in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost ports
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // In production, use CORS_ORIGIN from env
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5173'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
// Public routes (no authentication)
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Protected routes (require authentication)
// Apply audit logging middleware to all protected routes
app.use(`/api/${API_VERSION}`, auditLog);

app.use(`/api/${API_VERSION}/roles`, rolesRoutes);
app.use(`/api/${API_VERSION}/users`, usersRoutes);
app.use(`/api/${API_VERSION}/audit`, auditRoutes);
app.use(`/api/${API_VERSION}/terapis`, terapisRoutes);
app.use(`/api/${API_VERSION}/requirement`, requirementRoutes);
app.use(`/api/${API_VERSION}/tna`, tnaRoutes);
app.use(`/api/${API_VERSION}/evaluasi`, evaluasiRoutes);
app.use(`/api/${API_VERSION}/training`, trainingRoutes);
app.use(`/api/${API_VERSION}/statistics`, statisticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Training App API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      auth: `/api/${API_VERSION}/auth`,
      roles: `/api/${API_VERSION}/roles`,
      users: `/api/${API_VERSION}/users`,
      audit: `/api/${API_VERSION}/audit`,
      terapis: `/api/${API_VERSION}/terapis`,
      requirement: `/api/${API_VERSION}/requirement`,
      tna: `/api/${API_VERSION}/tna`,
      evaluasi: `/api/${API_VERSION}/evaluasi`,
      training: `/api/${API_VERSION}/training`,
      statistics: `/api/${API_VERSION}/statistics`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for Docker/Coolify
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 API available at http://${HOST}:${PORT}/api/${API_VERSION}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

