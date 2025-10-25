import winston from 'winston';
import LokiTransport from 'winston-loki';

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

// Define different log formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Add Loki transport if configured
if (process.env.LOKI_HOST) {
  const lokiTransport = new LokiTransport({
    host: process.env.LOKI_HOST,
    json: true,
    format: winston.format.json(),
    labels: {
      app: process.env.npm_package_name || 'payment-method-service',
      env: process.env.NODE_ENV || 'development',
    },
    replaceTimestamp: true,
    gracefulShutdown: true,
  }) as any; // Type assertion to handle winston-loki type issues

  transports.push(lokiTransport as any);
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