import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Standard handler for rate-limit violations
 */
const rateLimitHandler = (message: string) => (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.tooManyRequests(message));
};

/**
 * Global Rate Limiter for general API endpoints.
 */
export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 2000 : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests from this IP, please try again after 15 minutes.'),
  skip: (req: Request) => req.path === '/api/v1/health'
});

/**
 * Strict Rate Limiter for Authentication & Security-critical endpoints.
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 500 : env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts from this IP. Please try again after 15 minutes.')
});

/**
 * Strict Rate Limiter for Sensitive Financial & Inventory operations.
 */
export const sensitiveOpLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many consecutive requests for sensitive operation. Please wait a moment.')
});
