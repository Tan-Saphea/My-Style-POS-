import { z } from 'zod';

// ============================================================
// Environment Variable Validation
// Uses Zod to validate at build/runtime — fails fast if missing
// ============================================================

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .min(1, 'NEXT_PUBLIC_API_URL is required'),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_APP_NAME is required')
    .default('My Style'),
});

/**
 * Validated environment variables.
 * Accessing this will throw if required env vars are missing.
 */
function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!parsed.success) {
    console.error(
      'CRITICAL: Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment variables. Check .env.local file.');
  }

  return parsed.data;
}

export const env = getEnv();
