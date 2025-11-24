import { Module } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { RedisModule } from "../common/redis/redis.module";
import { AiModule } from "../ai/ai.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { RateLimitModule } from "../common/rate-limit/rate-limit.module";

@Module({
  imports: [PrismaModule, RedisModule, AiModule, TransactionsModule, RateLimitModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

