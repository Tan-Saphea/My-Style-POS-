import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatusCodes.js';
import { IErrorDetail } from '../types/index.js';

/**
 * Custom Operational Error Class for Express Application.
 * Differentiates operational (anticipated) errors from fatal programmer errors.
 */
export class ApiError extends Error {
  public statusCode: HttpStatusCode;
  public success: boolean;
  public errors: IErrorDetail[];
  public code: string;
  public isOperational: boolean;

  /**
   * @param statusCode - HTTP status code
   * @param message - Error description
   * @param errors - Array of specific error items (e.g. validation field issues)
   * @param code - Machine readable application error code
   * @param stack - Optional explicit stack trace
   */
  constructor(
    statusCode: HttpStatusCode,
    message: string,
    errors: IErrorDetail[] = [],
    code = 'API_ERROR',
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.code = code;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad request', errors: IErrorDetail[] = [], code = 'BAD_REQUEST'): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors, code);
  }

  static unauthorized(message = 'Unauthorized access', errors: IErrorDetail[] = [], code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, errors, code);
  }

  static forbidden(message = 'Forbidden access', errors: IErrorDetail[] = [], code = 'FORBIDDEN'): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, errors, code);
  }

  static notFound(message = 'Resource not found', errors: IErrorDetail[] = [], code = 'NOT_FOUND'): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, errors, code);
  }

  static conflict(message = 'Resource conflict', errors: IErrorDetail[] = [], code = 'CONFLICT'): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message, errors, code);
  }

  static unprocessableEntity(message = 'Validation failed', errors: IErrorDetail[] = [], code = 'VALIDATION_ERROR'): ApiError {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors, code);
  }

  static tooManyRequests(message = 'Too many requests, please try again later', errors: IErrorDetail[] = [], code = 'RATE_LIMIT_EXCEEDED'): ApiError {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, errors, code);
  }

  static internal(message = 'Internal server error', errors: IErrorDetail[] = [], code = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, errors, code);
  }
}
