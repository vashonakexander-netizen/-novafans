import { Module } from "@nestjs/common";
import { ObservabilityController } from "./observability.controller";
import { ObservabilityService } from "./observability.service";
import { RedisModule } from "../common/redis/redis.module";
import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [ObservabilityController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}

