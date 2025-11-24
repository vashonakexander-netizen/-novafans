import { Module } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { CreatorsController } from "./creators.controller";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { PrismaModule } from "../common/prisma/prisma.module";
import { LiveSessionsModule } from "../live-sessions/live-sessions.module";
import { StorageModule } from "../storage/storage.module";
import { CacheModule } from "../common/cache/cache.module";

@Module({
  imports: [PrismaModule, LiveSessionsModule, StorageModule, CacheModule],
  controllers: [CreatorsController, OnboardingController],
  providers: [CreatorsService, OnboardingService],
  exports: [CreatorsService],
})
export class CreatorsModule {}

