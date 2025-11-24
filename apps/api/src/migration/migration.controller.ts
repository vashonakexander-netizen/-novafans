import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Body, BadRequestException } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { MigrationService } from "./migration.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class MigrationImportDto {
  @IsEnum(["onlyfans", "fanvue"])
  source: "onlyfans" | "fanvue";

  @IsEnum(["drip", "publish"])
  mappingStrategy: "drip" | "publish";

  @IsOptional()
  @IsString()
  remoteUrl?: string;
}

@Controller("migration")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CREATOR)
export class MigrationController {
  constructor(private migrationService: MigrationService) {}

  @Post("import")
  @UseInterceptors(FilesInterceptor("files", 10))
  async import(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: MigrationImportDto
  ) {
    if (dto.remoteUrl) {
      return this.migrationService.importFromRemoteUrl(
        user.id,
        dto.remoteUrl,
        dto.source,
        dto.mappingStrategy
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException("No files provided");
    }

    // Find ZIP file
    const zipFile = files.find((f) => f.originalname.endsWith(".zip"));
    if (!zipFile) {
      throw new BadRequestException("ZIP file required for import");
    }

    return this.migrationService.importFromZip(
      user.id,
      zipFile.buffer,
      dto.source,
      dto.mappingStrategy
    );
  }
}

