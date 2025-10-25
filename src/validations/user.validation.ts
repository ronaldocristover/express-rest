import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    telp: z.string()
      .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)'),
    email: z.string()
      .email('Format email tidak valid')
      .optional()
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1, 'User ID wajib diisi'),
    nama: z.string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter')
      .optional(),
    telp: z.string()
      .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)')
      .optional(),
    email: z.string()
      .email('Format email tidak valid')
      .optional()
  });

  static readonly GET_BY_ID: ZodType = z.object({
    id: z.string().min(1, 'User ID wajib diisi')
  });

  static readonly DELETE: ZodType = z.object({
    id: z.string().min(1, 'User ID wajib diisi')
  });

  // Additional validation methods for specific use cases
  static create(userData: unknown) {
    return UserValidation.CREATE.parse(userData);
  }

  static update(updateData: unknown) {
    return UserValidation.UPDATE.parse(updateData);
  }

  static getById(idData: unknown) {
    return UserValidation.GET_BY_ID.parse(idData);
  }

  static delete(deleteData: unknown) {
    return UserValidation.DELETE.parse(deleteData);
  }
}