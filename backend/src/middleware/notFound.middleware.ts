import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to capture and handle unmatched 404 API routes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Resource not found: ${req.method} ${req.originalUrl}`));
};
