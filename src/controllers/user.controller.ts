import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { UserValidation } from '../validations/user.validation';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response';
import { logger } from '../config/logger.config';

export class UserController {
  /**
   * Get all users with pagination
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;

      let result;
      if (search) {
        result = await userService.search(search, page, pageSize);
        logger.info('Users searched successfully', { search, page, pageSize, total: result.total });
      } else {
        result = await userService.findAll(page, pageSize);
        logger.info('Users retrieved successfully', { page, pageSize, total: result.total });
      }

      sendSuccessResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Error getting users', { error: error instanceof Error ? error.message : error });
      sendErrorResponse(res, 'Internal server error', 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = UserValidation.getById({ id: req.params.id });
      const { id } = validatedData as { id: string };

      const user = await userService.findOne(id);

      if (!user) {
        logger.warn('User not found', { id });
        sendErrorResponse(res, 'User tidak ditemukan', 404);
        return;
      }

      logger.info('User retrieved successfully', { id });
      sendSuccessResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Error getting user by ID', {
        id: req.params.id,
        error: error instanceof Error ? error.message : error
      });
      sendErrorResponse(res, 'Invalid user ID', 400);
    }
  }

  /**
   * Create new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = UserValidation.create(req.body);
      const userData = validatedData as { nama: string; telp: string; email?: string };

      const user = await userService.create(userData);

      logger.info('User created successfully', { id: user.id, nama: user.nama });
      sendSuccessResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      logger.error('Error creating user', {
        body: req.body,
        error: error instanceof Error ? error.message : error
      });

      if (error instanceof Error) {
        if (error.message.includes('sudah terdaftar')) {
          sendErrorResponse(res, error.message, 409);
        } else {
          sendErrorResponse(res, error.message, 400);
        }
      } else {
        sendErrorResponse(res, 'Internal server error', 500);
      }
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedIdData = UserValidation.getById({ id: req.params.id });
      const { id } = validatedIdData as { id: string };

      const validatedUpdateData = UserValidation.update({ id, ...req.body });
      const { id: _, ...userData } = validatedUpdateData as {
        id: string;
        nama?: string;
        telp?: string;
        email?: string
      };

      const user = await userService.update(id, userData);

      logger.info('User updated successfully', { id });
      sendSuccessResponse(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Error updating user', {
        id: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : error
      });

      if (error instanceof Error) {
        if (error.message.includes('tidak ditemukan')) {
          sendErrorResponse(res, error.message, 404);
        } else if (error.message.includes('sudah digunakan')) {
          sendErrorResponse(res, error.message, 409);
        } else {
          sendErrorResponse(res, error.message, 400);
        }
      } else {
        sendErrorResponse(res, 'Internal server error', 500);
      }
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = UserValidation.delete({ id: req.params.id });
      const { id } = validatedData as { id: string };

      const user = await userService.remove(id);

      logger.info('User deleted successfully', { id });
      sendSuccessResponse(res, user, 'User deleted successfully');
    } catch (error) {
      logger.error('Error deleting user', {
        id: req.params.id,
        error: error instanceof Error ? error.message : error
      });

      if (error instanceof Error) {
        if (error.message.includes('tidak ditemukan')) {
          sendErrorResponse(res, error.message, 404);
        } else {
          sendErrorResponse(res, error.message, 400);
        }
      } else {
        sendErrorResponse(res, 'Internal server error', 500);
      }
    }
  }

  /**
   * Get user by telephone number
   */
  async getUserByTelp(req: Request, res: Response): Promise<void> {
    try {
      const { telp } = req.params;

      if (!telp) {
        sendErrorResponse(res, 'Nomor telepon wajib diisi', 400);
        return;
      }

      const user = await userService.findByTelp(telp);

      if (!user) {
        logger.warn('User not found by telp', { telp });
        sendErrorResponse(res, 'User tidak ditemukan', 404);
        return;
      }

      logger.info('User retrieved by telp successfully', { telp });
      sendSuccessResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Error getting user by telp', {
        telp: req.params.telp,
        error: error instanceof Error ? error.message : error
      });

      sendErrorResponse(res, 'Internal server error', 500);
    }
  }
}

export const userController = new UserController();