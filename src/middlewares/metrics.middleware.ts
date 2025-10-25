import { Request, Response, NextFunction } from 'express';
import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestActive,
  authenticationTotal,
  client
} from '../config/metrics.config';
import { logger } from '../config/logger.config';

// Track active requests
let activeRequests = 0;

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  activeRequests++;
  httpRequestActive.set(activeRequests);

  // Extract user agent for metrics
  const userAgent = req.get('User-Agent') || 'unknown';

  // Override res.end to track request completion
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    // Decrement active requests
    activeRequests--;
    httpRequestActive.set(activeRequests);

    // Extract route (use originalUrl if available, otherwise url)
    const route = req.originalUrl || req.url || 'unknown';

    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString(), userAgent)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();

    // Log slow requests
    if (duration > 2) {
      logger.warn('Slow request detected', {
        method: req.method,
        route,
        statusCode: res.statusCode,
        duration,
        userAgent
      });
    }

    // Call original end
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

export const authenticationMetrics = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    // Check if this is an authentication endpoint
    if (req.originalUrl?.includes('/users/login') ||
      req.originalUrl?.includes('/users/api-key') ||
      req.originalUrl?.includes('/users/register')) {

      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      authenticationTotal.labels(isSuccess ? 'success' : 'failure').inc();

      logger.debug('Authentication attempt recorded', {
        endpoint: req.originalUrl,
        success: isSuccess,
        statusCode: res.statusCode
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Metrics endpoint handler
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    logger.error('Error generating metrics', { error });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate metrics'
      }
    });
  }
};