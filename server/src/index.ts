import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// Configure CORS with more restrictive settings
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Ideally set to specific origins in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// Add request ID to each request
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Request logging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]({
      message: 'Request processed',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id']
    });
  });
  
  next();
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack
  });
  
  // Exit with error
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Promise Rejection',
    reason
  });
});

export default app;