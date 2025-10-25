import { Request, Response, NextFunction } from 'express';
import { logHttp, logger } from '../config/logger.config';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to log response time
  res.end = function (chunk?: any, encoding?: any): any {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || null,
      apiKey: (req as any).user?.apiKey || null
    };

    // Use Winston logger instead of console.log
    logHttp(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, logData);

    // Call original end function
    return originalEnd.call(res, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Request error', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || null,
      apiKey: (req as any).user?.apiKey || null,
    },
    timestamp: new Date().toISOString(),
  });

  next(err);
};