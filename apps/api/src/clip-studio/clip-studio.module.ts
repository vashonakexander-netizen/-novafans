import { Module } from "@nestjs/common";
import { ClipStudioController } from "./clip-studio.controller";
import { ClipStudioService } from "./clip-studio.service";
import { ClipProcessingService } from "./clip-processing.service";
import { ClipPostingService } from "./clip-posting.service";
import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ClipStudioController],
  providers: [ClipStudioService, ClipProcessingService, ClipPostingService],
})
export class ClipStudioModule {}
