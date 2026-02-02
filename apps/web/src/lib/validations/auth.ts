import { z } from 'zod';

// Strong password schema for new registrations and password resets
const strongPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'), // Keep lenient for login (existing users)
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: strongPasswordSchema, // Strict validation for new users
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordSchema, // Strict validation for password resets
});
