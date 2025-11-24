import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { TrustService } from "./trust.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { IsString, IsOptional, IsEnum } from "class-validator";

export class ReportCreatorDto {
  @IsString()
  creatorId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class ResolveReportDto {
  @IsEnum(["dismiss", "warn", "ban"])
  action: "dismiss" | "warn" | "ban";
}

@Controller("trust")
export class TrustController {
  constructor(private trustService: TrustService) {}

  @Post("report")
  @UseGuards(JwtAuthGuard)
  async reportCreator(@CurrentUser() user: any, @Body() dto: ReportCreatorDto) {
    return this.trustService.reportCreator(user.id, dto.creatorId, dto.reason, dto.details);
  }

  @Get("reports")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getReports() {
    return this.trustService.getPendingReports();
  }

  @Post("reports/:id/resolve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolveReport(
    @Param("id") reportId: string,
    @CurrentUser() admin: any,
    @Body() body: ResolveReportDto
  ) {
    return this.trustService.resolveReport(reportId, admin.id, body.action);
  }
}

