import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../common/redis/redis.service";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    private redis: RedisService,
    private prisma: PrismaService
  ) {}

  async getMetrics(): Promise<string> {
    // Prometheus format metrics
    const metrics: string[] = [];

    try {
      // Database connection status
      await this.prisma.$queryRaw`SELECT 1`;
      metrics.push('db_connection_status{status="up"} 1');
    } catch (error) {
      metrics.push('db_connection_status{status="down"} 0');
    }

    try {
      // Redis connection status
      await this.redis.getClient().ping();
      metrics.push('redis_connection_status{status="up"} 1');
    } catch (error) {
      metrics.push('redis_connection_status{status="down"} 0');
    }

    // User counts
    const userCount = await this.prisma.user.count();
    metrics.push(`users_total ${userCount}`);

    const creatorCount = await this.prisma.user.count({ where: { role: "CREATOR" } });
    metrics.push(`creators_total ${creatorCount}`);

    // Subscription counts
    const activeSubs = await this.prisma.subscription.count({ where: { status: "ACTIVE" } });
    metrics.push(`subscriptions_active ${activeSubs}`);

    // Post counts
    const publishedPosts = await this.prisma.post.count({ where: { status: "PUBLISHED" } });
    metrics.push(`posts_published ${publishedPosts}`);

    return metrics.join("\n") + "\n";
  }

  async getCacheHealth(): Promise<{
    status: string;
    redis: {
      connected: boolean;
      memory?: string;
      keys?: number;
    };
  }> {
    try {
      const client = this.redis.getClient();
      const info = await client.info("memory");
      const keys = await client.dbsize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : "unknown";

      return {
        status: "ok",
        redis: {
          connected: true,
          memory,
          keys: keys || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Cache health check failed: ${error}`);
      return {
        status: "error",
        redis: {
          connected: false,
        },
      };
    }
  }
}

