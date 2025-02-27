import { Request, Response, NextFunction } from 'express';
import { AppError, createSafeError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Generate request ID if not already present
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Log the error with request context
  logger.error({
    message: 'Error processing request',
    error: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined
  });
  
  // Create safe error response
  const { message, statusCode } = createSafeError(err);
  
  // Check for operational vs programming errors
  const isOperational = err instanceof AppError ? err.isOperational : false;
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    requestId,
    // Only include stack in development for non-operational errors
    ...(process.env.NODE_ENV === 'development' && !isOperational ? { stack: err.stack } : {})
  });
};