import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post("register-token")
  @UseGuards(JwtAuthGuard)
  async registerToken(
    @CurrentUser() user: any,
    @Body() body: { expoPushToken: string }
  ) {
    await this.notificationsService.registerToken(user.id, body.expoPushToken);
    return { success: true };
  }
}

