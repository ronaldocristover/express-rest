import { z, ZodType, ZodError } from 'zod';

export class Validation {
  static validate<T>(schema: ZodType<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  }

  static validateOptional<T>(schema: ZodType<T>, data: unknown): T | undefined {
    if (data === undefined || data === null) {
      return undefined;
    }
    return this.validate(schema, data);
  }
}