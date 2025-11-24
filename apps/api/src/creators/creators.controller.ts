import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { UpdateCreatorProfileDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { LiveSessionsService } from "../live-sessions/live-sessions.service";

@Controller("creators")
export class CreatorsController {
  constructor(
    private creatorsService: CreatorsService,
    private liveSessionsService: LiveSessionsService
  ) {}

  @Get(":username")
  async getPublicProfile(@Param("username") username: string) {
    return this.creatorsService.getPublicProfile(username);
  }

  @Get("me/profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMyProfile(@CurrentUser() user: any) {
    return this.creatorsService.getMyProfile(user.id);
  }

  @Put("me/profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateCreatorProfileDto) {
    return this.creatorsService.updateProfile(user.id, dto);
  }

  @Get("me/live-sessions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMyLiveSessions(@CurrentUser() user: any) {
    return this.liveSessionsService.getCreatorSessions(user.id);
  }
}


