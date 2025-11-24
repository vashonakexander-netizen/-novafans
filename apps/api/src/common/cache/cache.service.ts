import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private cacheEnabled: boolean = false;

  constructor(private redis: RedisService) {}

  onModuleInit() {
    // Check if Redis is available
    this.redis.getClient().ping().then(() => {
      this.cacheEnabled = true;
      this.logger.log("Cache service enabled (Redis)");
    }).catch(() => {
      this.logger.warn("Cache service disabled (Redis not available)");
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error: ${error}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      await this.redis.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      this.logger.error(`Cache set error: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error}`);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      // Note: This is a simplified implementation
      // In production, use Redis SCAN for pattern matching
      const client = this.redis.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache invalidate pattern error: ${error}`);
    }
  }
}

