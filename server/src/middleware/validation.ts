import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { z } from 'zod';

/**
 * Middleware to validate request data against a Zod schema
 */
export const validate = (schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request data
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // Replace validated data
      req.body = parsedData.body;
      req.query = parsedData.query;
      req.params = parsedData.params;
      
      next();
    } catch (error) {
      // Extract validation errors from Zod
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
          
        return next(new ValidationError(errorMessage));
      }
      
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const Schemas = {
  // Chat message validation
  chat: z.object({
    body: z.object({
      message: z.string().min(1, 'Message is required'),
      history: z.array(
        z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string()
        })
      ).optional().default([])
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
  })
};