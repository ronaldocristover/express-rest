import { Request, Response, NextFunction } from 'express';
import { createError } from './error-middleware';
import { userService } from '../services/user.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    nama: string;
    telp: string;
    email: string | null;
    apiKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const apiAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw createError('API key is required', 401);
    }

    // Find user by API key
    // const user = await userService.findByApiKey(apiKey);

    // if (!user) {
    //   throw createError('Invalid API key', 401);
    // }

    // // Attach user to request object
    // req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};