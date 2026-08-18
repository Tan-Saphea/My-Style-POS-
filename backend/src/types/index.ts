import { Request, Response, NextFunction } from 'express';

/**
 * Standard Pagination Metadata Interface
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Field-level Error Detail Interface
 */
export interface IErrorDetail {
  field?: string;
  message: string;
  rule?: string;
}

/**
 * Standard API Response Structure
 */
export interface IApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPaginationMeta;
  errors?: IErrorDetail[];
  code?: string;
  stack?: string;
}

/**
 * Async Express Route Handler Type
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;
