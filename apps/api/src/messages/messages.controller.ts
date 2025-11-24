import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { RateLimit, RateLimitGuard } from "../common/rate-limit/rate-limit.guard";
import { MessagesService } from "./messages.service";
import { CreateMessageDto, SendPaidMessageDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("conversations")
  @UseGuards(JwtAuthGuard)
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get("conversations/:id")
  @UseGuards(JwtAuthGuard)
  async getConversation(@Param("id") id: string, @CurrentUser() user: any) {
    return this.messagesService.getConversation(id, user.id);
  }

  @Post("conversations")
  @UseGuards(JwtAuthGuard)
  async createMessage(@CurrentUser() user: any, @Body() dto: CreateMessageDto) {
    return this.messagesService.createMessage(user.id, dto);
  }

  @Post("conversations/:conversationId/send-paid")
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.CREATOR)
  @RateLimit({ maxRequests: 60, windowMs: 60 * 1000 }) // 60 per minute
  async sendPaidMessage(
    @Param("conversationId") conversationId: string,
    @CurrentUser() user: any,
    @Body() dto: SendPaidMessageDto
  ) {
    return this.messagesService.sendPaidMessage(conversationId, user.id, dto);
  }

  @Post(":messageId/unlock")
  @UseGuards(JwtAuthGuard)
  async unlockMessage(@Param("messageId") messageId: string, @CurrentUser() user: any) {
    return this.messagesService.unlockMessage(messageId, user.id);
  }

  @Post(":messageId/purchase")
  @UseGuards(JwtAuthGuard)
  async purchaseMessageAccess(@Param("messageId") messageId: string, @CurrentUser() user: any) {
    return this.messagesService.purchaseMessageAccess(messageId, user.id);
  }
}

