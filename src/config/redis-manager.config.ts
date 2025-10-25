import { createClient, RedisClientType } from 'redis';
import { logger } from './logger.config';

class RedisManager {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
      },
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      logger.error('Failed to disconnect from Redis', { error });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const serializedValue = JSON.stringify(value);

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      logger.error('Redis SET error', { key, error });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }

      return true;
    } catch (error) {
      logger.error('Redis INVALIDE PATTERN error', { pattern, error });
      return false;
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export const redisClient = new RedisManager();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.disconnect();
});

process.on('SIGTERM', async () => {
  await redisClient.disconnect();
});