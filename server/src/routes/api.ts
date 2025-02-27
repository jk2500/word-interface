import { Router } from 'express';
import chatController from '../controllers/chatController';
import { validate, Schemas } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * API version prefix for future compatibility
 */
const API_V1 = '/v1';

/**
 * Chat endpoints
 */
// Apply rate limiting to chat endpoints
const chatRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  max: 20,             // 20 requests per minute
  standardHeaders: true,
  message: 'Too many requests, please try again later'
});

// Regular chat endpoint
router.post(
  `${API_V1}/chat`,
  chatRateLimiter,
  validate(Schemas.chat),
  chatController.handleChat
);

// Streaming chat endpoint
router.post(
  `${API_V1}/chat/stream`,
  chatRateLimiter,
  validate(Schemas.chat),
  chatController.handleStreamingChat
);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

export default router;