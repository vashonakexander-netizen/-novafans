import { Module } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionsController } from "./subscriptions.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { RateLimitModule } from "../common/rate-limit/rate-limit.module";
import { CryptoGatewayModule } from "../crypto-gateway/crypto-gateway.module";

@Module({
  imports: [PrismaModule, TransactionsModule, RateLimitModule, CryptoGatewayModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

