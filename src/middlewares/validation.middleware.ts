import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './error-middleware';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues.map(err => err.message).join(', ');
        return next(createError(message, 400));
      }
      return next(createError('Validation error', 400));
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues.map(err => err.message).join(', ');
        return next(createError(message, 400));
      }
      return next(createError('Validation error', 400));
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues.map(err => err.message).join(', ');
        return next(createError(message, 400));
      }
      return next(createError('Validation error', 400));
    }
  };
};