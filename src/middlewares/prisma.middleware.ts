import { Request, Response, NextFunction } from 'express';
import { databaseQueryDuration, databaseQueryTotal } from '../config/metrics.config';
import { logger } from '../config/logger.config';

// Database query tracking middleware
export const databaseMetrics = (req: Request, res: Response, next: NextFunction): void => {
  // Track database query performance for this request
  const queryTimes: Array<{ operation: string; table: string; duration: number }> = [];

  // Store query tracking on the request object
  (req as any).dbMetrics = {
    startTime: Date.now(),
    queryTimes,
    addQuery: (operation: string, table: string, duration: number) => {
      queryTimes.push({ operation, table, duration });
      databaseQueryDuration.labels(operation, table).observe(duration / 1000);
      databaseQueryTotal.labels(operation, table, 'success').inc();
    }
  };

  // Log slow queries after response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
    const dbMetrics = (req as any).dbMetrics;
    if (dbMetrics && dbMetrics.queryTimes.length > 0) {
      const slowQueries = dbMetrics.queryTimes.filter((q: any) => q.duration > 100);
      if (slowQueries.length > 0) {
        logger.warn('Slow database queries detected', {
          url: req.url,
          method: req.method,
          slowQueries: slowQueries.map((q: any) => ({
            operation: q.operation,
            table: q.table,
            duration: `${q.duration}ms`
          }))
        });
      }
    }
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};