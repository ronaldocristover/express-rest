import { Router } from 'express';
import { getMetrics } from '../middlewares/metrics.middleware';

export const metricsRoutes = Router();

// Metrics endpoint for Prometheus scraping
metricsRoutes.get('/', getMetrics);

// Health check endpoint with metrics
metricsRoutes.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'payment-method-service'
  });
});