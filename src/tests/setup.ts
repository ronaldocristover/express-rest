import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY_SECRET = 'test-api-key-secret';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/payment_service_test';

// Global test timeout
jest.setTimeout(10000);

// Mock external services
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    },
    paymentMethods: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      detach: jest.fn(),
    },
  })),
}));

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  })),
}));

// Mock payment provider configurations
const mockPaymentProviderConfig = {
  stripe: {
    apiKey: 'sk_test_mock',
    webhookSecret: 'whsec_test_mock',
    environment: 'sandbox' as const,
  },
  paypal: {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    environment: 'sandbox' as const,
  },
};

// Make mock config available globally
(global as any).mockPaymentProviderConfig = mockPaymentProviderConfig;

// Clean up mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});