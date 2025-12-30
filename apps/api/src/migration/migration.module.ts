import { Module } from "@nestjs/common";
import { MigrationService } from "./migration.service";
import { MigrationController } from "./migration.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [MigrationController],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}


