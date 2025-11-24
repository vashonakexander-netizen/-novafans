import { Controller, Post, Get, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateCryptoSubscriptionDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post(":creatorId")
  @UseGuards(JwtAuthGuard)
  async subscribe(@Param("creatorId") creatorId: string, @CurrentUser() user: any) {
    return this.subscriptionsService.subscribe(user.id, creatorId);
  }

  @Post(":creatorId/crypto")
  @UseGuards(JwtAuthGuard)
  async createCryptoSubscription(
    @Param("creatorId") creatorId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCryptoSubscriptionDto
  ) {
    return this.subscriptionsService.createCryptoSubscription(user.id, creatorId, dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.getMySubscriptions(user.id);
  }

  @Delete(":creatorId")
  @UseGuards(JwtAuthGuard)
  async cancel(@Param("creatorId") creatorId: string, @CurrentUser() user: any) {
    return this.subscriptionsService.cancel(user.id, creatorId);
  }
}

