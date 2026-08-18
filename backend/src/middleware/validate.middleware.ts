import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { IErrorDetail } from '../types/index.js';

export interface IValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Generic Express Middleware for Zod Schema Validation.
 * Validates request body, query parameters, and URL route parameters against Zod schemas.
 *
 * @param schemas - Object containing optional zod schemas: { body, query, params }
 */
export const validate = (schemas: IValidationSchemas): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: IErrorDetail[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          rule: err.code
        }));

        return next(
          ApiError.unprocessableEntity('Validation failed: Invalid request payload', formattedErrors)
        );
      }
      return next(error);
    }
  };
};
