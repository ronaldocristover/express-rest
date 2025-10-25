import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middlewares/error-middleware';
import { requestLogger, errorLogger } from './middlewares/logging.middleware';
import { metricsMiddleware, authenticationMetrics } from './middlewares/metrics.middleware';
import { apiAuthMiddleware } from './middlewares/api-auth.middleware';
import { healthCheckRouter } from './routes/health.route';
import { metricsRoutes } from './routes/metrics.route';
import { logger, stream } from './config/logger.config';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Metrics middleware (should be early)
app.use(metricsMiddleware);
app.use(authenticationMetrics);

// Logging middleware
app.use(morgan('combined', { stream }));
app.use(requestLogger);

// Health check endpoint (no auth required)
app.use('/health', healthCheckRouter);

// Metrics endpoint (no auth required)
app.use('/metrics', metricsRoutes);

// Import individual route modules for selective auth
import { userRoutes } from './routes/user.route';
import { paymentMethodRoutes } from './routes/payment-method.route';
import { paymentProviderRoutes } from './routes/payment-provider.route';
import { testRoutes } from './routes/test.route';

// User routes without authentication
app.use('/api/v1/users', userRoutes);

// Test routes for logging (no authentication required for testing)
app.use('/api/v1/test', testRoutes);

// Other API routes with authentication
app.use('/api/v1/payment-methods', apiAuthMiddleware, paymentMethodRoutes);
app.use('/api/v1/payment-providers', apiAuthMiddleware, paymentProviderRoutes);

// Error handling middleware (should be last)
app.use(errorLogger);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Payment Method Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;