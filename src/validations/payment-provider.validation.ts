import { z, ZodType } from 'zod';

export class PaymentProviderValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(2, 'Provider name must be at least 2 characters long').max(50, 'Provider name cannot exceed 50 characters'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(100, 'Display name cannot exceed 100 characters'),
    isActive: z.boolean().optional().default(true),
    config: z.record(z.string(), z.any()).optional()
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1, 'Provider ID is required'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(100, 'Display name cannot exceed 100 characters').optional(),
    isActive: z.boolean().optional(),
    config: z.record(z.string(), z.any()).optional()
  });

  static readonly PARAMS: ZodType = z.object({
    id: z.string().min(1, 'Provider ID is required')
  });

  // Additional validation methods
  static create(providerData: unknown) {
    return PaymentProviderValidation.CREATE.parse(providerData);
  }

  static update(updateData: unknown) {
    return PaymentProviderValidation.UPDATE.parse(updateData);
  }

  static params(paramsData: unknown) {
    return PaymentProviderValidation.PARAMS.parse(paramsData);
  }
}