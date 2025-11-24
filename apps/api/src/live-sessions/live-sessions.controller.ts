import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "../common/rate-limit/rate-limit.guard";
import { LiveSessionsService } from "./live-sessions.service";
import { CreateLiveSessionDto, SendLiveTipDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtGuard } from "../common/guards/optional-jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("live-sessions")
export class LiveSessionsController {
  constructor(private liveSessionsService: LiveSessionsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  async getPublicSessions(@CurrentUser() user?: any) {
    return this.liveSessionsService.getPublicSessions();
  }

  @Get(":id")
  @UseGuards(OptionalJwtGuard)
  async getSession(@Param("id") id: string, @CurrentUser() user?: any) {
    return this.liveSessionsService.getSession(id, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async createSession(@CurrentUser() user: any, @Body() dto: CreateLiveSessionDto) {
    return this.liveSessionsService.createSession(user.id, dto);
  }

  @Post(":id/start")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async startSession(@Param("id") id: string, @CurrentUser() user: any) {
    return this.liveSessionsService.startSession(id, user.id);
  }

  @Post(":id/end")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async endSession(@Param("id") id: string, @CurrentUser() user: any) {
    return this.liveSessionsService.endSession(id, user.id);
  }

  @Post(":id/tips")
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit({ maxRequests: 20, windowMs: 60 * 1000 }) // 20 per minute
  async sendTip(@Param("id") id: string, @CurrentUser() user: any, @Body() dto: SendLiveTipDto) {
    return this.liveSessionsService.sendTip(id, user.id, dto);
  }

  @Get("creator/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMySessions(@CurrentUser() user: any) {
    return this.liveSessionsService.getCreatorSessions(user.id);
  }

  @Get(":id/viewer-token")
  @UseGuards(JwtAuthGuard)
  async getViewerToken(@Param("id") id: string, @CurrentUser() user: any) {
    return this.liveSessionsService.getViewerToken(id, user.id, user.username || user.displayName);
  }

  @Get(":id/publisher-token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getPublisherToken(@Param("id") id: string, @CurrentUser() user: any) {
    return this.liveSessionsService.getPublisherToken(id, user.id, user.username || user.displayName);
  }
}

