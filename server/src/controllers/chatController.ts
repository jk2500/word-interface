import { Request, Response, NextFunction } from 'express';
import { openaiClient } from '../config/openai';
import { LRUCache } from '../utils/cache';
import { OpenAIError } from '../utils/errors';
import logger from '../utils/logger';

// Create an LRU cache for message responses
const messageCache = new LRUCache<string>({
  maxSize: 200,
  ttl: 10 * 60 * 1000 // 10 minutes
});

// List of active SSE connections for cleanup
interface ActiveConnection {
  req: Request;
  res: Response;
  closeHandler: () => void;
}
const activeConnections = new Set<ActiveConnection>();

// Clean up on process exit
process.on('SIGINT', () => cleanupConnections());
process.on('SIGTERM', () => cleanupConnections());

/**
 * Handle cleanup of all active connections
 */
function cleanupConnections() {
  logger.info(`Cleaning up ${activeConnections.size} active SSE connections`);
  for (const conn of activeConnections) {
    try {
      conn.res.end();
      activeConnections.delete(conn);
    } catch (error) {
      logger.error(`Error closing connection: ${error}`);
    }
  }
}

export const chatController = {
  /**
   * Handle regular (non-streaming) chat completions
   */
  async handleChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      logger.info({
        message: 'Chat request received',
        requestId: req.headers['x-request-id'],
        messageLength: message.length
      });
      
      // Generate cache key from message and limited history
      const lastHistoryItems = history.slice(-3);
      const cacheKey = JSON.stringify({
        message,
        history: lastHistoryItems
      });
      
      // Check cache first
      const cachedResponse = messageCache.get(cacheKey);
      if (cachedResponse) {
        logger.debug('Cache hit for message');
        return res.json({ message: cachedResponse });
      }
      
      // Prepare messages for OpenAI
      const messages = [...history, { role: 'user', content: message }];
      
      // Get response from OpenAI
      const completion = await openaiClient.createChatCompletion(messages, {
        max_tokens: 800  // Set appropriate token limit
      });
      
      const response = completion.choices[0].message.content;
      
      // Cache the response
      messageCache.set(cacheKey, response);
      
      // Send the response to the client
      res.json({ message: response });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Handle streaming chat completions with Server-Sent Events
   */
  async handleStreamingChat(req: Request, res: Response, next: NextFunction) {
    let hasError = false;
    
    // Setup connection cleanup handler
    const closeHandler = () => {
      const conn = [...activeConnections].find(c => c.req === req);
      if (conn) {
        activeConnections.delete(conn);
        logger.debug(`Client disconnected, connections: ${activeConnections.size}`);
      }
    };
    
    try {
      const { message, history } = req.body;
      logger.info({
        message: 'Streaming chat request received',
        requestId: req.headers['x-request-id'],
        messageLength: message.length
      });
      
      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable Nginx buffering
      });
      
      // Track this connection for cleanup
      const connectionInfo = { req, res, closeHandler };
      activeConnections.add(connectionInfo);
      req.on('close', closeHandler);
      
      // Send initial event to confirm connection
      res.write(`event: connected\ndata: {}\n\n`);
      
      // Prepare messages for OpenAI
      const messages = [...history, { role: 'user', content: message }];
      
      // Get streaming response from OpenAI
      const stream = await openaiClient.createStreamingChatCompletion(messages, {
        max_tokens: 800
      });
      
      // Process each chunk as it arrives
      let fullResponse = '';
      for await (const chunk of stream) {
        if (req.socket.destroyed) {
          logger.debug('Client disconnected during streaming');
          break;
        }
        
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        if (content) {
          // Send each piece of content as an SSE event
          res.write(`event: message\ndata: ${JSON.stringify({ content })}\n\n`);
          
          // Flush the response to ensure immediate delivery
          if (res.flush) {
            res.flush();
          }
        }
      }
      
      // Use the full response for caching
      if (!req.socket.destroyed && fullResponse) {
        // Generate cache key from message and limited history
        const lastHistoryItems = history.slice(-3);
        const cacheKey = JSON.stringify({
          message,
          history: lastHistoryItems
        });
        
        // Cache the complete response
        messageCache.set(cacheKey, fullResponse);
      }
      
      // Send complete event to signal end of response
      if (!req.socket.destroyed) {
        res.write(`event: complete\ndata: {}\n\n`);
        activeConnections.delete(connectionInfo);
        res.end();
      }
    } catch (error) {
      hasError = true;
      logger.error({
        message: 'Streaming Error',
        error
      });
      
      if (!res.headersSent) {
        return next(error);
      }
      
      // If headers are already sent, send error as SSE event
      const errorMessage = error instanceof OpenAIError ? error.message : 'An error occurred while processing your request';
      res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    } finally {
      if (!hasError) {
        const conn = [...activeConnections].find(c => c.req === req);
        if (conn) {
          activeConnections.delete(conn);
        }
      }
    }
  }
};

export default chatController;