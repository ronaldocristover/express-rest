import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  meta?: { [key: string]: any }
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    meta
  };
};

export const createErrorResponse = (
  message: string,
  error?: string
): ApiResponse<null> => {
  return {
    success: false,
    message,
    error,
    data: null
  };
};

export const createPaginatedResponse = <T>(
  data: T,
  total: number,
  page: number,
  limit: number,
  message?: string,
  meta?: { [key: string]: any }
): PaginatedResponse<T> => {
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    meta
  };
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  response: ApiResponse<T>
): void => {
  res.status(statusCode).json(response);
};

export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: { [key: string]: any }
): void => {
  const response = createSuccessResponse(data, message, meta);
  sendResponse(res, statusCode, response);
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
): void => {
  const response = createErrorResponse(message, error);
  sendResponse(res, statusCode, response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T,
  total: number,
  page: number,
  limit: number,
  message?: string,
  statusCode: number = 200,
  meta?: { [key: string]: any }
): void => {
  const response = createPaginatedResponse(data, total, page, limit, message, meta);
  sendResponse(res, statusCode, response);
};