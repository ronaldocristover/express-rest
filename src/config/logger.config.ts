import winston from 'winston';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
dotenv.config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};


// Define which transports the logger must use
const transports = [
  // Console transport - stateless friendly
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
      : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
  }),
];

// Add Loki transport if configured
if (process.env.LOKI_HOST) {
  const lokiHost = `http://${process.env.LOKI_HOST}:${process.env.LOKI_PORT || 3100}`;

  // Log Loki configuration for debugging
  console.log('🔧 Loki Configuration:');
  console.log(`   Host: ${lokiHost}`);
  console.log(`   App: ${process.env.npm_package_name || 'payment-method-service'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Basic Auth: ${process.env.LOKI_USERNAME ? 'Configured' : 'Not configured'}`);

  const lokiTransport = new LokiTransport({
    host: lokiHost,
    json: true,
    format: winston.format.json(),
    labels: {
      app: process.env.npm_package_name || 'payment-method-service',
      env: process.env.NODE_ENV || 'development',
    },
    replaceTimestamp: true,
    gracefulShutdown: true,
    ...(process.env.LOKI_USERNAME && process.env.LOKI_PASSWORD && {
      basicAuth: `${process.env.LOKI_USERNAME}:${process.env.LOKI_PASSWORD}`
    })
  }) as any; // Type assertion to handle winston-loki type issues

  // Add event listeners for debugging
  lokiTransport.on('error', (error: any) => {
    console.error('❌ Loki Transport Error:', error);
  });

  lokiTransport.on('logged', (info: any) => {
    console.log('✅ Log sent to Loki:', info.labels || 'no labels');
  });

  transports.push(lokiTransport as any);
} else {
  console.log('⚠️  Loki not configured - LOKI_HOST environment variable not set');
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.npm_package_name || 'payment-method-service',
    environment: process.env.NODE_ENV || 'development',
  },
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
    ...meta,
  });
};

const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Export the logger and helper functions
export {
  logger,
  stream,
  logError,
  logInfo,
  logWarn,
  logDebug,
  logHttp,
};

export default logger;