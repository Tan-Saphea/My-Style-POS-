import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AsyncRequestHandler } from '../types/index.js';

/**
 * Higher-order function to wrap asynchronous Express middleware/controllers.
 * Automatically catches any rejected promises or errors and forwards them to the centralized error middleware.
 *
 * @param fn - Async Express handler (req, res, next) => Promise<any>
 * @returns Express middleware handler
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
