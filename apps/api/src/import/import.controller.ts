import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ImportService } from "./import.service";
import {
  CreateImportSessionDto,
  AddImportFilesDto,
  CommitImportSessionDto,
} from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("creator/import")
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post("sessions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async createSession(@CurrentUser() user: any, @Body() dto: CreateImportSessionDto) {
    return this.importService.createImportSession(user.id, dto);
  }

  @Post("sessions/remote")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async createRemoteSession(@CurrentUser() user: any, @Body() dto: CreateImportSessionDto) {
    return this.importService.createImportSession(user.id, dto);
  }

  @Post("sessions/:id/files")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async addFiles(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: AddImportFilesDto
  ) {
    return this.importService.addFiles(id, user.id, dto);
  }

  @Get("sessions/:id/preview")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getPreview(@Param("id") id: string, @CurrentUser() user: any) {
    return this.importService.getPreview(id, user.id);
  }

  @Post("sessions/:id/commit")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async commit(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: CommitImportSessionDto
  ) {
    return this.importService.commit(id, user.id, dto);
  }

  @Post("sessions/:id/cancel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async cancel(@Param("id") id: string, @CurrentUser() user: any) {
    return this.importService.cancel(id, user.id);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMySessions(@CurrentUser() user: any) {
    return this.importService.getMyImportSessions(user.id);
  }
}


