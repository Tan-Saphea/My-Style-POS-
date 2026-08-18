// ============================================================
// API Response Types
// Matches backend response format from Express REST API
// ============================================================

/**
 * Standard API response wrapper.
 * All backend endpoints return this shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Paginated API response.
 * Used for list endpoints with server-side pagination.
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination metadata returned by the server.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard query parameters for list endpoints.
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Standardized API error shape.
 * Used by error-handler.ts to normalize error responses.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode?: number;
}

/**
 * Validation error detail from the backend.
 */
export interface ValidationError {
  field: string;
  message: string;
}
