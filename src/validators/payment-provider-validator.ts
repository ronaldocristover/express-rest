import { z } from 'zod';

export const paymentProviderSchemas = {
  params: z.object({
    id: z.string().min(1, 'Provider ID is required')
  }),

  create: z.object({
    name: z.string().min(2, 'Provider name must be at least 2 characters long').max(50, 'Provider name cannot exceed 50 characters'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(100, 'Display name cannot exceed 100 characters'),
    isActive: z.boolean().optional().default(true),
    config: z.record(z.string(), z.any()).optional()
  }),

  update: z.object({
    displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(100, 'Display name cannot exceed 100 characters').optional(),
    isActive: z.boolean().optional(),
    config: z.record(z.string(), z.any()).optional()
  })
};