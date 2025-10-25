import { Response, NextFunction } from 'express';
import { prisma } from '../config/database.config';
import { createError, asyncHandler } from '../middlewares/error-middleware';
import { AuthenticatedRequest } from '../middlewares/api-auth.middleware';
import { paymentMethodService } from '../services/payment-method.service';
import { paymentProviderService } from '../services/payment-provider.service';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/response';

export const paymentMethodController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, type, isActive, providerId } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const activeOnly = isActive === 'true';

    const result = await paymentMethodService.getAllForUser(
      userId,
      pageNum,
      limitNum,
      type as string,
      activeOnly,
      providerId as string
    );

    sendPaginatedResponse(res, result, result.total, pageNum, limitNum);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const paymentMethod = await paymentMethodService.findByIdForUser(id, userId);
    if (!paymentMethod) {
      throw createError('Payment method not found', 404);
    }

    sendSuccessResponse(res, { paymentMethod });
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const {
      providerId,
      type,
      providerMethodId,
      last4,
      expiryMonth,
      expiryYear,
      brand,
      isDefault = false,
      metadata
    } = req.body;

    // Check if provider exists and is active
    const provider = await paymentProviderService.findById(providerId);
    if (!provider || !provider.isActive) {
      throw createError('Invalid or inactive payment provider', 400);
    }

    // Check if payment method already exists for this user
    const existingMethod = await paymentMethodService.findByProviderMethodId(
      providerMethodId,
      userId
    );
    if (existingMethod) {
      throw createError('Payment method already exists', 409);
    }

    // If setting as default, unset other default methods
    if (isDefault) {
      await paymentMethodService.unsetDefaultForUser(userId);
    }

    const paymentMethod = await paymentMethodService.create({
      user: {
        connect: { id: userId }
      },
      provider: {
        connect: { id: providerId }
      },
      type,
      providerMethodId,
      last4,
      expiryMonth,
      expiryYear,
      brand,
      isDefault,
      metadata
    });

    sendSuccessResponse(res, { paymentMethod }, 'Payment method created successfully', 201);
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { type, last4, expiryMonth, expiryYear, brand, metadata } = req.body;

    // Check if payment method exists and belongs to user
    const existingMethod = await paymentMethodService.findByIdForUser(id, userId);
    if (!existingMethod) {
      throw createError('Payment method not found', 404);
    }

    const paymentMethod = await paymentMethodService.update(id, {
      type,
      last4,
      expiryMonth,
      expiryYear,
      brand,
      metadata
    });

    sendSuccessResponse(res, { paymentMethod }, 'Payment method updated successfully');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existingMethod = await paymentMethodService.findByIdForUser(id, userId);
    if (!existingMethod) {
      throw createError('Payment method not found', 404);
    }

    await paymentMethodService.delete(id);

    sendSuccessResponse(res, null, 'Payment method deleted successfully');
  }),

  setDefault: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existingMethod = await paymentMethodService.findByIdForUser(id, userId);
    if (!existingMethod) {
      throw createError('Payment method not found', 404);
    }

    // Unset all other default methods for this user
    await paymentMethodService.unsetDefaultForUser(userId);

    // Set this method as default
    const paymentMethod = await paymentMethodService.setDefault(id);

    sendSuccessResponse(res, { paymentMethod }, 'Payment method set as default successfully');
  }),

  deactivate: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existingMethod = await paymentMethodService.findByIdForUser(id, userId);
    if (!existingMethod) {
      throw createError('Payment method not found', 404);
    }

    const paymentMethod = await paymentMethodService.deactivate(id);

    sendSuccessResponse(res, { paymentMethod }, 'Payment method deactivated successfully');
  })
};