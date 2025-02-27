/**
 * Custom error classes for better error handling
 */

// Base error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Used to distinguish operational errors from programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// API related errors
export class APIError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(message, statusCode);
  }
}

// Validation errors (400)
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// Authentication errors (401)
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

// Authorization errors (403)
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(message, 403);
  }
}

// Not found errors (404)
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Rate limit errors (429)
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

// OpenAI specific errors
export class OpenAIError extends APIError {
  constructor(message: string, statusCode = 500) {
    super(`OpenAI API Error: ${message}`, statusCode);
  }
}

// Helper to create safe error message for client
export const createSafeError = (error: any): { message: string, statusCode: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }
  
  // For unknown errors, return a generic message in production
  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message || 'Unknown error',
    statusCode: 500
  };
};