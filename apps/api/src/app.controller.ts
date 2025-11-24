import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./common/prisma/prisma.service";
import { RedisService } from "./common/redis/redis.service";
import { getCryptoConfig } from "@novafans/config";

@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  @Get("health")
  async health() {
    const cryptoConfig = getCryptoConfig();
    
    const health = {
      status: "ok",
      db: "unknown",
      redis: "unknown",
      crypto: {
        provider: cryptoConfig.provider,
        configured: cryptoConfig.provider === "fake" || !!cryptoConfig.apiKey,
        mode: cryptoConfig.provider === "fake" || !cryptoConfig.apiKey ? "fake" : "real",
      },
    };

    // Check database connection (best-effort, don't crash)
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.db = "ok";
    } catch (error) {
      health.db = "fail";
      health.status = "degraded";
    }

    // Check Redis connection (best-effort, don't crash)
    try {
      await this.redis.getClient().ping();
      health.redis = "ok";
    } catch (error) {
      health.redis = "fail";
      // Redis failure is non-critical, only mark degraded if DB also fails
      if (health.db === "fail") {
        health.status = "degraded";
      }
    }

    return health;
  }
}

