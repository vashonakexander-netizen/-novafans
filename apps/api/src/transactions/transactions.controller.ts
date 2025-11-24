import { Controller, Get, UseGuards } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("transactions")
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@CurrentUser() user: any) {
    return this.transactionsService.findByUser(user.id);
  }

  @Get("as-creator")
  @UseGuards(JwtAuthGuard)
  async getCreatorTransactions(@CurrentUser() user: any) {
    return this.transactionsService.findByCreator(user.id);
  }
}

