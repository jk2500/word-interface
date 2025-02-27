# Word Interface Server

Backend API server for the Word Interface application, providing AI-powered document editing features.

## Features

- Rich text document processing
- AI chat integration with OpenAI
- Streaming responses with Server-Sent Events (SSE)
- TypeScript implementation with strong typing
- Structured error handling
- Rate limiting for API protection
- Request validation with Zod
- Efficient LRU caching
- Comprehensive logging

## Project Structure

```
src/
├── config/        # Configuration files
│   └── openai.ts  # OpenAI client configuration
├── controllers/   # Request handlers
│   └── chatController.ts
├── middleware/    # Express middleware
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validation.ts
├── routes/        # API routes
│   └── api.ts
├── utils/         # Utility functions
│   ├── cache.ts   # LRU cache implementation
│   ├── errors.ts  # Custom error classes
│   └── logger.ts  # Logging utility
└── index.ts       # Application entry point
```

## Getting Started

1. Copy `.env.example` to `.env` and fill in your API keys
2. Install dependencies:
   ```
   npm install
   ```
3. Run development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```
5. Start production server:
   ```
   npm start
   ```

## API Endpoints

### Chat API

- `POST /api/v1/chat` - Regular chat completion
- `POST /api/v1/chat/stream` - Streaming chat completion with SSE

### System

- `GET /api/health` - Health check endpoint

## Dependencies

- Express - Web server framework
- OpenAI - AI integration
- Zod - Request validation
- Helmet - Security headers
- Compression - Response compression
- TypeScript - Static typing
