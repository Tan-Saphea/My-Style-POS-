import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Zod Schema for strict runtime Environment Variables validation.
 * Ensures the application will fail-fast at boot if any critical secret
 * or configuration is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // CORS
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // JWT Configuration (Secrets must be at least 32 characters for security)
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Password Hashing
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(16).default(12),

  // Cookie Signing
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters long'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 mins
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10)
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ CRITICAL: Environment configuration validation failed:');
    const formattedErrors = result.error.format();
    Object.entries(formattedErrors).forEach(([key, value]) => {
      if (key !== '_errors' && value && '_errors' in value && Array.isArray(value._errors) && value._errors.length > 0) {
        console.error(`  - ${key}: ${value._errors.join(', ')}`);
      }
    });
    process.exit(1);
  }

  return result.data;
};

export const env: EnvConfig = parseEnv();
