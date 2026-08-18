import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { IApiResponsePayload, IErrorDetail } from '../types/index.js';

interface IMongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/**
 * Normalizes different error types (Zod, Mongoose, JWT, System) into standard ApiError instances.
 */
const normalizeError = (err: unknown): ApiError => {
  // Already an instance of our custom ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors: IErrorDetail[] = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return ApiError.unprocessableEntity('Validation failed', formattedErrors);
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: "${err.value}" is not a valid identifier`);
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const formattedErrors: IErrorDetail[] = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    return ApiError.unprocessableEntity('Database schema validation failed', formattedErrors);
  }

  // MongoDB Duplicate Key Error (E11000)
  const mongoErr = err as IMongoError;
  if (mongoErr && mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue || {})[0] || 'field';
    const value = mongoErr.keyValue ? mongoErr.keyValue[field] : '';
    return ApiError.conflict(
      `Duplicate value entered: A record with ${field} "${value}" already exists`,
      [{ field, message: `${field} must be unique` }]
    );
  }

  const errorObj = err as Error;

  // JWT Token Errors
  if (errorObj?.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authorization token');
  }
  if (errorObj?.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authorization token has expired');
  }

  // Payload too large error
  if ((err as { type?: string })?.type === 'entity.too.large') {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Request payload exceeds maximum allowed size (1MB)',
      [],
      'PAYLOAD_TOO_LARGE'
    );
  }

  // Fallback generic 500 error
  return ApiError.internal(
    env.NODE_ENV === 'production' ? 'Internal server error' : errorObj?.message || 'Unknown server error',
    [],
    'INTERNAL_SERVER_ERROR'
  );
};

/**
 * Centralized Express Error Handling Middleware.
 * Catches all thrown/forwarded errors, logs them, and formats safe JSON responses for clients.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const normalizedError = normalizeError(err);
  const rawError = err as Error;

  // Log internal error details
  if (normalizedError.statusCode >= 500) {
    logger.error(
      {
        err: rawError,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      'Unhandled Server Exception'
    );
  } else {
    logger.warn(
      {
        statusCode: normalizedError.statusCode,
        message: normalizedError.message,
        method: req.method,
        url: req.originalUrl,
        errors: normalizedError.errors,
      },
      'Operational Request Error'
    );
  }

  const responsePayload: IApiResponsePayload = {
    success: false,
    message: normalizedError.message,
    code: normalizedError.code,
    errors: normalizedError.errors.length > 0 ? normalizedError.errors : undefined
  };

  // Only attach stack trace in development environment for debugging
  if (env.NODE_ENV === 'development' && rawError?.stack) {
    responsePayload.stack = rawError.stack;
  }

  res.status(normalizedError.statusCode).json(responsePayload);
};
