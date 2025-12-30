import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { PayoutsService } from "./payouts.service";
import { CreatePayoutRequestDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("payouts")
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getMyPayouts(@CurrentUser() user: any) {
    return this.payoutsService.getMyPayouts(user.id);
  }

  @Post("request")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async createPayoutRequest(@CurrentUser() user: any, @Body() dto: CreatePayoutRequestDto) {
    return this.payoutsService.createPayoutRequest(user.id, dto);
  }
}


