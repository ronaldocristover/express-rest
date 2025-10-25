import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label to all metrics
register.setDefaultLabels({
  app: 'payment-method-service'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'user_agent'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestActive = new client.Gauge({
  name: 'http_requests_active',
  help: 'Number of active HTTP requests'
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const databaseQueryTotal = new client.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});

const cacheHitRate = new client.Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_type']
});

const cacheOperations = new client.Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'cache_type', 'status']
});

const authenticationTotal = new client.Counter({
  name: 'authentication_total',
  help: 'Total number of authentication attempts',
  labelNames: ['status']
});

const paymentProviderOperations = new client.Counter({
  name: 'payment_provider_operations_total',
  help: 'Total number of payment provider operations',
  labelNames: ['provider', 'operation', 'status']
});

const activePaymentProviders = new client.Gauge({
  name: 'active_payment_providers',
  help: 'Number of active payment providers'
});

const registeredUsers = new client.Gauge({
  name: 'registered_users',
  help: 'Total number of registered users'
});

const paymentMethods = new client.Gauge({
  name: 'payment_methods',
  help: 'Total number of payment methods',
  labelNames: ['type', 'status']
});

const errorRate = new client.Gauge({
  name: 'error_rate',
  help: 'Error rate percentage',
  labelNames: ['error_type']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestActive);
register.registerMetric(databaseQueryDuration);
register.registerMetric(databaseQueryTotal);
register.registerMetric(cacheHitRate);
register.registerMetric(cacheOperations);
register.registerMetric(authenticationTotal);
register.registerMetric(paymentProviderOperations);
register.registerMetric(activePaymentProviders);
register.registerMetric(registeredUsers);
register.registerMetric(paymentMethods);
register.registerMetric(errorRate);

// Health check metrics
const healthCheckStatus = new client.Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service']
});

register.registerMetric(healthCheckStatus);

export {
  register,
  client,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestActive,
  databaseQueryDuration,
  databaseQueryTotal,
  cacheHitRate,
  cacheOperations,
  authenticationTotal,
  paymentProviderOperations,
  activePaymentProviders,
  registeredUsers,
  paymentMethods,
  errorRate,
  healthCheckStatus
};