import { Module } from "@nestjs/common";
import { LiveSessionsService } from "./live-sessions.service";
import { LiveSessionsController } from "./live-sessions.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { RateLimitModule } from "../common/rate-limit/rate-limit.module";
import { CryptoGatewayModule } from "../crypto-gateway/crypto-gateway.module";
import { LiveKitService } from "./livekit.service";

@Module({
  imports: [PrismaModule, TransactionsModule, RateLimitModule, CryptoGatewayModule],
  controllers: [LiveSessionsController],
  providers: [LiveSessionsService, LiveKitService],
  exports: [LiveSessionsService], // Export so other modules can use it
})
export class LiveSessionsModule {}

