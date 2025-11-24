import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { PayoutsService } from "./payouts.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("admin/payouts")
export class AdminPayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPayouts(@Query("status") status?: string) {
    return this.payoutsService.getAllPayouts(status);
  }

  @Post(":id/mark-processing")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markProcessing(@Param("id") id: string) {
    return this.payoutsService.markProcessing(id);
  }

  @Post(":id/mark-paid")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markPaid(@Param("id") id: string, @Body() body?: { txHash?: string }) {
    return this.payoutsService.markPaid(id, body?.txHash);
  }

  @Post(":id/mark-rejected")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markRejected(@Param("id") id: string, @Body() body?: { reason?: string }) {
    return this.payoutsService.markRejected(id, body?.reason);
  }
}

