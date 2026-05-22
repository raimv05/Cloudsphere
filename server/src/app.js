import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import caseStudyRoutes from './routes/caseStudyRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

const app = express();

// Custom request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON & URL-encoded parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/security-reports', securityRoutes);

// Base API route / Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      ...err
    } : {}
  });
});

export default app;
