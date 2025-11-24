import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

@Injectable()
export class RateLimitService {
  constructor(private redis: RedisService) {}

  async checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const { maxRequests, windowMs } = config;
    const redisKey = `rate_limit:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Get current count
      const count = await this.redis.getClient().zcount(redisKey, windowStart, now);

      if (count >= maxRequests) {
        // Get oldest entry to calculate reset time
        const oldest = await this.redis.getClient().zrange(redisKey, 0, 0, "WITHSCORES");
        const resetAt = oldest.length > 0 ? parseInt(oldest[1]) + windowMs : now + windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await this.redis.getClient().zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.getClient().expire(redisKey, Math.ceil(windowMs / 1000));

      // Clean old entries
      await this.redis.getClient().zremrangebyscore(redisKey, 0, windowStart);

      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        resetAt: now + windowMs,
      };
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error("Rate limit check failed:", error);
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now + windowMs,
      };
    }
  }
}

