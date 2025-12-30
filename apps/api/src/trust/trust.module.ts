import { Module } from "@nestjs/common";
import { TrustService } from "./trust.service";
import { TrustController } from "./trust.controller";
import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TrustController],
  providers: [TrustService],
  exports: [TrustService],
})
export class TrustModule {}


