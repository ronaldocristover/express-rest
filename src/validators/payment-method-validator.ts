import { z } from 'zod';

export const paymentMethodSchemas = {
  params: z.object({
    id: z.string().min(1, 'Payment method ID is required')
  }),

  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']).optional(),
    isActive: z.coerce.boolean().optional(),
    providerId: z.string().optional()
  }),

  create: z.object({
    providerId: z.string().min(1, 'Provider ID is required'),
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']),
    providerMethodId: z.string().min(1, 'Provider method ID is required'),
    last4: z.string().length(4).optional(),
    expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear()).optional(),
    brand: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
    metadata: z.record(z.string(), z.any()).optional()
  }),

  update: z.object({
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']).optional(),
    last4: z.string().length(4).optional(),
    expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear()).optional(),
    brand: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  })
};