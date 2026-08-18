import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types/api';

// ============================================================
// API Error Handler
// Sanitizes errors before displaying to users.
// Never exposes stack traces, DB errors, or backend paths.
// ============================================================

/**
 * Human-readable error messages by HTTP status code.
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request contains invalid data. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This operation conflicts with existing data.',
  422: 'The request could not be processed. Please check the data.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'Service is temporarily unavailable. Please try again later.',
};

/**
 * Extract a safe, user-friendly error message from an API error.
 * Strips stack traces, database errors, and internal paths.
 */
export function getErrorMessage(error: unknown): string {
  // Axios error with response
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as ApiErrorResponse;
    const status = error.response.status;

    // Use backend message if it looks safe (not a raw error dump)
    if (data?.message && isSafeMessage(data.message)) {
      return data.message;
    }

    // Fall back to status-based messages
    return STATUS_MESSAGES[status] || 'An unexpected error occurred.';
  }

  // Network error (no response)
  if (error instanceof AxiosError && !error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please check your connection and try again.';
    }
    return 'Unable to connect to the server. Please check your connection.';
  }

  // Generic Error object
  if (error instanceof Error) {
    return isSafeMessage(error.message) ? error.message : 'An unexpected error occurred.';
  }

  return 'An unexpected error occurred.';
}

/**
 * Extract validation errors from the API response.
 */
export function getValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (error instanceof AxiosError && error.response?.status === 400) {
    const data = error.response.data as ApiErrorResponse;
    if (data?.errors && Array.isArray(data.errors)) {
      const fieldErrors: Record<string, string> = {};
      data.errors.forEach((err) => {
        if (err.field && err.message) {
          fieldErrors[err.field] = err.message;
        }
      });
      return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
    }
  }
  return null;
}

/**
 * Check if an error message is safe to display.
 * Filters out stack traces, MongoDB errors, file paths, etc.
 */
function isSafeMessage(message: string): boolean {
  const dangerousPatterns = [
    /at\s+\w+\s*\(/i,         // Stack trace: "at Function ("
    /node_modules/i,           // Internal path
    /MongoError/i,             // MongoDB error
    /MongoServerError/i,       // MongoDB server error
    /BSON/i,                   // BSON error
    /Cast to ObjectId/i,       // Mongoose cast error
    /E11000/i,                 // MongoDB duplicate key
    /\/src\//i,                // Source path
    /\.js:\d+/i,               // File:line reference
    /TypeError/i,              // JS runtime error
    /ReferenceError/i,         // JS runtime error
    /SyntaxError/i,            // JS runtime error
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(message));
}

/**
 * Check if the error is a network error.
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}

/**
 * Check if the error is a specific HTTP status.
 */
export function isHttpError(error: unknown, status: number): boolean {
  return error instanceof AxiosError && error.response?.status === status;
}
