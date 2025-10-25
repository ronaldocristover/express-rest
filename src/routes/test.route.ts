import { Router } from 'express';
import { logError, logInfo, logWarn, logDebug, logHttp } from '../config/logger.config';

const router = Router();

/**
 * GET /test/logs
 * Test endpoint to generate different types of logs for Loki testing
 */
router.get('/logs', (req, res) => {
  const testId = Date.now().toString();
  const userAgent = req.get('User-Agent') || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Test different log levels
  logInfo('Test log entry - Info level', {
    testId,
    endpoint: '/test/logs',
    method: 'GET',
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    type: 'test_log_info'
  });

  logWarn('Test log entry - Warning level', {
    testId,
    endpoint: '/test/logs',
    warning: 'This is a test warning for Loki verification',
    type: 'test_log_warn'
  });

  logDebug('Test log entry - Debug level', {
    testId,
    endpoint: '/test/logs',
    debugInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    type: 'test_log_debug'
  });

  // Simulate an error log (without actually throwing an error)
  const testError = new Error('Test error for Loki verification');
  logError('Test log entry - Error level', testError, {
    testId,
    endpoint: '/test/logs',
    errorType: 'test_error',
    type: 'test_log_error'
  });

  logHttp('Test log entry - HTTP level', {
    testId,
    endpoint: '/test/logs',
    method: 'GET',
    statusCode: 200,
    responseTime: Date.now() - parseInt(testId),
    type: 'test_log_http'
  });

  res.json({
    success: true,
    message: 'Test logs generated successfully',
    testId,
    lokiConfig: {
      host: process.env.LOKI_HOST,
      port: process.env.LOKI_PORT,
      path: process.env.LOKI_PATH,
      configured: !!process.env.LOKI_HOST
    },
    logsGenerated: [
      'info',
      'warn',
      'debug',
      'error',
      'http'
    ],
    timestamp: new Date().toISOString(),
    checkInstructions: {
      grafanaLoki: `Check Grafana Loki with query: {app="payment-method-service"} |= "testId":"${testId}"`,
      console: 'Check console output for structured logs',
      timeframe: 'Logs should appear in Loki within 10-30 seconds'
    }
  });
});

/**
 * GET /test/logs/stress
 * Generate multiple log entries for stress testing
 */
router.get('/logs/stress', (req, res) => {
  const count = parseInt(req.query.count as string) || 10;
  const testId = `stress_${Date.now()}`;

  for (let i = 1; i <= count; i++) {
    logInfo('Stress test log entry', {
      testId,
      iteration: i,
      total: count,
      endpoint: '/test/logs/stress',
      timestamp: new Date().toISOString(),
      type: 'stress_test_log'
    });
  }

  res.json({
    success: true,
    message: `Generated ${count} stress test logs`,
    testId,
    checkLoki: `{app="payment-method-service"} |= "testId":"${testId}"`
  });
});

/**
 * GET /test/loki-status
 * Check Loki connection and configuration status
 */
router.get('/loki-status', (req, res) => {
  const lokiConfig = {
    host: process.env.LOKI_HOST,
    port: process.env.LOKI_PORT,
    path: process.env.LOKI_PATH,
    username: process.env.LOKI_USERNAME ? 'configured' : 'not configured',
    password: process.env.LOKI_PASSWORD ? 'configured' : 'not configured',
    fullUrl: process.env.LOKI_HOST
      ? `http://${process.env.LOKI_HOST}:${process.env.LOKI_PORT || 3100}${process.env.LOKI_PATH || '/loki/api/v1/push'}`
      : null
  };

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    loki: {
      configured: !!process.env.LOKI_HOST,
      config: lokiConfig,
      status: process.env.LOKI_HOST ? 'configured' : 'not configured'
    },
    troubleshooting: {
      checkConsole: 'Look for 🔧, ✅, and ❌ emojis in console output',
      testEndpoint: 'GET /api/v1/test/logs to generate test logs',
      manualTest: `curl -X GET "http://localhost:8888/loki/api/v1/push" -H "Content-Type: application/json" -d '{"streams": [{ "stream": {"app": "test"}, "values": [[ "' + Date.now() * 1000000 + '", "test message" ]] }]}'`,
      commonIssues: [
        'Loki not running on localhost:3100',
        'Wrong host/port configuration',
        'Network connectivity issues',
        'Authentication required but not configured'
      ]
    },
    nextSteps: [
      '1. Check console for Loki configuration messages on startup',
      '2. Call GET /api/v1/test/logs to generate logs',
      '3. Look for ✅ "Log sent to Loki" messages',
      '4. Check Grafana Loki with provided queries'
    ]
  });
});

export { router as testRoutes };