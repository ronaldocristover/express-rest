import { redisClient } from '../config/redis-manager.config';
import { logger } from '../config/logger.config';

export class CacheService {
  private static instance: CacheService;

  private constructor() { }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Cache user by API key
  async cacheUserByApiKey(apiKey: string, user: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `user:apikey:${apiKey}`;
    await redisClient.set(key, user, ttlSeconds);
    logger.debug('Cached user by API key', { apiKey });
  }

  async getUserByApiKey(apiKey: string): Promise<any | null> {
    const key = `user:apikey:${apiKey}`;
    const user = await redisClient.get(key);
    if (user) {
      logger.debug('Cache hit for user by API key', { apiKey });
    }
    return user;
  }

  async invalidateUserByApiKey(apiKey: string): Promise<void> {
    const key = `user:apikey:${apiKey}`;
    await redisClient.del(key);
    logger.debug('Invalidated user cache by API key', { apiKey });
  }

  // Cache payment providers
  async cachePaymentProviders(providers: any[], ttlSeconds: number = 1800): Promise<void> {
    const key = 'payment-providers:all';
    await redisClient.set(key, providers, ttlSeconds);
    logger.debug('Cached all payment providers');
  }

  async getPaymentProviders(): Promise<any[] | null> {
    const key = 'payment-providers:all';
    const providers = await redisClient.get(key) as any[];
    if (providers) {
      logger.debug('Cache hit for payment providers');
    }
    return providers;
  }

  async invalidatePaymentProviders(): Promise<void> {
    await redisClient.del('payment-providers:all');
    await redisClient.invalidatePattern('payment-provider:*');
    logger.debug('Invalidated payment providers cache');
  }

  // Cache specific payment provider
  async cachePaymentProvider(id: string, provider: any, ttlSeconds: number = 1800): Promise<void> {
    const key = `payment-provider:${id}`;
    await redisClient.set(key, provider, ttlSeconds);
    logger.debug('Cached payment provider', { id });
  }

  async getPaymentProvider(id: string): Promise<any | null> {
    const key = `payment-provider:${id}`;
    const provider = await redisClient.get(key);
    if (provider) {
      logger.debug('Cache hit for payment provider', { id });
    }
    return provider;
  }

  async invalidatePaymentProvider(id: string): Promise<void> {
    await redisClient.del(`payment-provider:${id}`);
    await redisClient.invalidatePattern('payment-providers:all');
    logger.debug('Invalidated payment provider cache', { id });
  }

  // Cache payment methods for user
  async cacheUserPaymentMethods(userId: string, paymentMethods: any[], ttlSeconds: number = 600): Promise<void> {
    const key = `user:${userId}:payment-methods`;
    await redisClient.set(key, paymentMethods, ttlSeconds);
    logger.debug('Cached user payment methods', { userId });
  }

  async getUserPaymentMethods(userId: string): Promise<any[] | null> {
    const key = `user:${userId}:payment-methods`;
    const paymentMethods = await redisClient.get(key) as any[];
    if (paymentMethods) {
      logger.debug('Cache hit for user payment methods', { userId });
    }
    return paymentMethods;
  }

  async invalidateUserPaymentMethods(userId: string): Promise<void> {
    await redisClient.del(`user:${userId}:payment-methods`);
    logger.debug('Invalidated user payment methods cache', { userId });
  }

  // Cache active provider instances (for PaymentProviderManager)
  async cacheActiveProvider(name: string, providerConfig: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `provider:instance:${name.toLowerCase()}`;
    await redisClient.set(key, providerConfig, ttlSeconds);
    logger.debug('Cached active provider instance', { name });
  }

  async getActiveProvider(name: string): Promise<any | null> {
    const key = `provider:instance:${name.toLowerCase()}`;
    const provider = await redisClient.get(key);
    if (provider) {
      logger.debug('Cache hit for active provider', { name });
    }
    return provider;
  }

  async invalidateActiveProvider(name: string): Promise<void> {
    await redisClient.del(`provider:instance:${name.toLowerCase()}`);
    logger.debug('Invalidated active provider cache', { name });
  }

  async invalidateAllActiveProviders(): Promise<void> {
    await redisClient.invalidatePattern('provider:instance:*');
    logger.debug('Invalidated all active providers cache');
  }

  // Health check for Redis
  async isHealthy(): Promise<boolean> {
    try {
      const result = await redisClient.set('health:check', 'ok', 10);
      return result;
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  // Clear all cache (for development/testing)
  async clearAll(): Promise<void> {
    await redisClient.invalidatePattern('*');
    logger.warn('Cleared all cache');
  }
}

export const cacheService = CacheService.getInstance();