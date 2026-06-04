import { Module } from "@nestjs/common";
import { AgencyController } from "./agency.controller";
import { AgencyPublicController } from "./agency-public.controller";
import { AgencyService } from "./agency.service";
import { AgencyInboxService } from "./agency-inbox.service";
import { AgencyVaultService } from "./agency-vault.service";
import { AgencyAnalyticsService } from "./agency-analytics.service";
import { PrismaModule } from "../common/prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [AgencyController, AgencyPublicController],
  providers: [AgencyService, AgencyInboxService, AgencyVaultService, AgencyAnalyticsService],
  exports: [AgencyService],
})
export class AgencyModule {}
