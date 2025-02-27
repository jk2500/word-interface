import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { LRUCache } from '../utils/cache';

interface RateLimiterOptions {
  windowMs: number;   // Timeframe for which requests are counted
  max: number;        // Max requests per IP in the windowMs timeframe
  standardHeaders: boolean; // Send standard rate limit headers
  message?: string;   // Error message
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * Rate limiting middleware to protect against abuse
 */
export const rateLimiter = (options: RateLimiterOptions) => {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 100,            // 100 requests per minute by default
    standardHeaders = true,
    message = 'Too many requests, please try again later'
  } = options;
  
  // Create cache to store rate limit info per IP
  const cache = new LRUCache<RateLimitInfo>({
    maxSize: 10000,       // Max 10,000 IPs in cache
    ttl: windowMs * 2     // Double the window to ensure cleanup
  });
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `ratelimit:${ip}`;
    
    // Get current rate limit info or create new entry
    const now = Date.now();
    const resetTime = now + windowMs;
    
    let info = cache.get(key);
    if (!info) {
      info = { count: 0, resetTime };
    }
    
    // Reset count if window has passed
    if (now > info.resetTime) {
      info = { count: 0, resetTime };
    }
    
    // Increment request count
    info.count += 1;
    
    // Store updated info
    cache.set(key, info);
    
    // Calculate remaining requests and time to reset
    const remaining = Math.max(0, max - info.count);
    const reset = Math.ceil((info.resetTime - now) / 1000); // in seconds
    
    // Set rate limit headers if enabled
    if (standardHeaders) {
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', reset.toString());
    }
    
    // If limit is exceeded, return error
    if (info.count > max) {
      // Set retry-after header
      res.setHeader('Retry-After', reset.toString());
      
      // Throw rate limit error
      return next(new RateLimitError(message));
    }
    
    next();
  };
};