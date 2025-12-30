import { Controller, Get, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("creators")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("me/analytics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMyAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getCreatorAnalytics(user.id);
  }
}


