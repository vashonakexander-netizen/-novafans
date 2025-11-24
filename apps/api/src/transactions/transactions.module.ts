import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { PaymentsController } from "./payments.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { RateLimitModule } from "../common/rate-limit/rate-limit.module";
import { CryptoGatewayModule } from "../crypto-gateway/crypto-gateway.module";

@Module({
  imports: [PrismaModule, RateLimitModule, CryptoGatewayModule],
  controllers: [TransactionsController, PaymentsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

