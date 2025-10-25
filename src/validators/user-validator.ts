import { z } from 'zod';

export const userSchemas = {
  register: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters').optional()
  }),

  login: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
  }),

  generateApiKey: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
  }),

  updateProfile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters').optional(),
    email: z.string().email('Please provide a valid email address').optional()
  })
};