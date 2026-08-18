import { z } from 'zod';

// ============================================================
// Zod Validation Schemas
// Frontend validation for UX — backend validates again
// ============================================================

// ---- Reusable Field Validators ----

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(100, 'Email must be less than 100 characters');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-]{7,15}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const priceSchema = z
  .number()
  .min(0, 'Price must be a positive number')
  .max(999999.99, 'Price exceeds maximum');

export const quantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .min(0, 'Quantity cannot be negative')
  .max(999999, 'Quantity exceeds maximum');

export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color (e.g., #FF0000)');

export const requiredString = (fieldName: string, maxLength: number = 200) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

// ---- Form Schemas ----

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const categorySchema = z.object({
  name: requiredString('Category name', 100),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const sizeSchema = z.object({
  name: requiredString('Size name', 50),
  description: z.string().max(200).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type SizeFormData = z.infer<typeof sizeSchema>;

export const colorSchema = z.object({
  name: requiredString('Color name', 50),
  hexCode: hexColorSchema,
  description: z.string().max(200).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type ColorFormData = z.infer<typeof colorSchema>;
