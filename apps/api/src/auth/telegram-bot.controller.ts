import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../common/prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User } from "@prisma/client";

/**
 * Server-to-server routes for the Telegram bot.
 * GET /users/telegram/:chatId requires X-Telegram-Bot-Secret matching TELEGRAM_BOT_API_SECRET.
 * POST /users/telegram/link links the logged-in user (JWT) to a Telegram chat id.
 */
@Controller("users")
export class TelegramBotController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private assertBotSecret(secret: string | undefined): void {
    const expected = process.env.TELEGRAM_BOT_API_SECRET?.trim();
    if (!expected) {
      throw new UnauthorizedException("Telegram bot API not configured (set TELEGRAM_BOT_API_SECRET)");
    }
    if (secret !== expected) {
      throw new UnauthorizedException("Invalid Telegram bot secret");
    }
  }

  @Get("telegram/:chatId")
  async getByTelegramChatId(
    @Param("chatId") chatId: string,
    @Headers("x-telegram-bot-secret") secret: string
  ) {
    this.assertBotSecret(secret);

    const user = await this.prisma.user.findFirst({
      where: { telegramChatId: chatId },
    });

    if (!user) {
      return null;
    }

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned");
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      displayName: user.displayName,
      role: user.role,
      token,
      username: user.username,
    };
  }

  @Post("telegram/link")
  @UseGuards(JwtAuthGuard)
  async linkTelegram(
    @CurrentUser() user: User,
    @Body() body: { telegramChatId?: string }
  ) {
    const telegramChatId = body.telegramChatId?.trim();
    if (!telegramChatId) {
      throw new BadRequestException("telegramChatId is required");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId },
    });

    return { ok: true };
  }
}
