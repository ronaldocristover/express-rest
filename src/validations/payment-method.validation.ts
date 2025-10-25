import { z, ZodType } from 'zod';

export class PaymentMethodValidation {
  static readonly CREATE: ZodType = z.object({
    providerId: z.string().min(1, 'Provider ID is required'),
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']),
    providerMethodId: z.string().min(1, 'Provider method ID is required'),
    last4: z.string().length(4).optional(),
    expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear()).optional(),
    brand: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
    metadata: z.record(z.string(), z.any()).optional()
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1, 'Payment method ID is required'),
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']).optional(),
    last4: z.string().length(4).optional(),
    expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear()).optional(),
    brand: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  });

  static readonly PARAMS: ZodType = z.object({
    id: z.string().min(1, 'Payment method ID is required')
  });

  static readonly QUERY: ZodType = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'OTHER']).optional(),
    activeOnly: z.coerce.boolean().optional(),
    providerId: z.string().optional()
  });

  // Additional validation methods
  static create(paymentMethodData: unknown) {
    return PaymentMethodValidation.CREATE.parse(paymentMethodData);
  }

  static update(updateData: unknown) {
    return PaymentMethodValidation.UPDATE.parse(updateData);
  }

  static params(paramsData: unknown) {
    return PaymentMethodValidation.PARAMS.parse(paramsData);
  }

  static query(queryData: unknown) {
    return PaymentMethodValidation.QUERY.parse(queryData);
  }
}