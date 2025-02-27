import OpenAI from 'openai';
import { OpenAIError } from '../utils/errors';
import logger from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  const errorMessage = 'Missing OPENAI_API_KEY environment variable';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// OpenAI client configuration
const openai = new OpenAI({
  apiKey,
  organization: process.env.OPENAI_ORG_ID,
  timeout: 30000, // 30 second timeout
  maxRetries: 2   // Retry failed requests twice
});

// Wrap the OpenAI client with error handling
export const openaiClient = {
  /**
   * Create a chat completion with error handling
   */
  async createChatCompletion(messages: any[], options: any = {}) {
    try {
      const defaultOptions = {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000
      };
      
      return await openai.chat.completions.create({
        ...defaultOptions,
        ...options,
        messages
      });
    } catch (error: any) {
      logger.error({
        message: 'OpenAI API error',
        error: error.message,
        status: error.status,
        errorType: error.type
      });
      
      // Map OpenAI error codes to HTTP status codes
      let statusCode = 500;
      if (error.status === 400) statusCode = 400;
      if (error.status === 401) statusCode = 401;
      if (error.status === 429) statusCode = 429;
      
      throw new OpenAIError(error.message, statusCode);
    }
  },
  
  /**
   * Create a streaming chat completion with error handling
   */
  async createStreamingChatCompletion(messages: any[], options: any = {}) {
    try {
      const defaultOptions = {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      };
      
      return await openai.chat.completions.create({
        ...defaultOptions,
        ...options,
        messages
      });
    } catch (error: any) {
      logger.error({
        message: 'OpenAI API streaming error',
        error: error.message,
        status: error.status,
        errorType: error.type
      });
      
      // Map OpenAI error codes to HTTP status codes
      let statusCode = 500;
      if (error.status === 400) statusCode = 400;
      if (error.status === 401) statusCode = 401;
      if (error.status === 429) statusCode = 429;
      
      throw new OpenAIError(error.message, statusCode);
    }
  }
};

export default openaiClient;