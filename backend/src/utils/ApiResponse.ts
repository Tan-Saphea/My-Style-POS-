import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatusCodes.js';
import { IApiResponsePayload, IPaginationMeta } from '../types/index.js';

/**
 * Standardized API Response Structure for all successful endpoints.
 */
export class ApiResponse<T = unknown> {
  public statusCode: HttpStatusCode;
  public success: boolean;
  public message: string;
  public data?: T;
  public pagination?: IPaginationMeta;

  /**
   * @param statusCode - HTTP status code
   * @param data - Response payload
   * @param message - Descriptive success message
   * @param pagination - Optional pagination metadata
   */
  constructor(
    statusCode: HttpStatusCode,
    data?: T,
    message = 'Success',
    pagination?: IPaginationMeta
  ) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }

  /**
   * Helper to send JSON response directly to Express Response
   */
  send(res: Response): Response {
    const payload: IApiResponsePayload<T> = {
      success: this.success,
      message: this.message,
      data: this.data
    };

    if (this.pagination) {
      payload.pagination = this.pagination;
    }

    return res.status(this.statusCode).json(payload);
  }

  static success<T = unknown>(
    res: Response,
    data?: T,
    message = 'Success',
    statusCode: HttpStatusCode = HTTP_STATUS.OK,
    pagination?: IPaginationMeta
  ): Response {
    return new ApiResponse<T>(statusCode, data, message, pagination).send(res);
  }

  static created<T = unknown>(
    res: Response,
    data?: T,
    message = 'Resource created successfully'
  ): Response {
    return new ApiResponse<T>(HTTP_STATUS.CREATED, data, message).send(res);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
