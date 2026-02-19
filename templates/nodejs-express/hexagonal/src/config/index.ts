import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  STRIPE_SECRET_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const config = {
  env: _env.data.NODE_ENV,
  port: parseInt(_env.data.PORT, 10),
  databaseUrl: _env.data.DATABASE_URL,
  jwtSecret: _env.data.JWT_SECRET,
  stripeSecretKey: _env.data.STRIPE_SECRET_KEY,
};
