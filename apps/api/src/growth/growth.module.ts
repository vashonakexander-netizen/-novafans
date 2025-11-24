import { Module } from "@nestjs/common";
import { GrowthService } from "./growth.service";
import { GrowthProcessor } from "./growth.processor";
import { PrismaModule } from "../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { StorageModule } from "../storage/storage.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [PrismaModule, NotificationsModule, StorageModule, AiModule],
  providers: [GrowthService, GrowthProcessor],
  exports: [GrowthService, GrowthProcessor],
})
export class GrowthModule {}

