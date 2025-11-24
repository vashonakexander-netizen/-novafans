import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { RateLimitModule } from "./common/rate-limit/rate-limit.module";
import { CacheModule } from "./common/cache/cache.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CreatorsModule } from "./creators/creators.module";
import { PostsModule } from "./posts/posts.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { MessagesModule } from "./messages/messages.module";
import { AiModule } from "./ai/ai.module";
import { ImportModule } from "./import/import.module";
import { SchedulingModule } from "./scheduling/scheduling.module";
import { AdminModule } from "./admin/admin.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { PayoutsModule } from "./payouts/payouts.module";
import { StorageModule } from "./storage/storage.module";
import { LiveSessionsModule } from "./live-sessions/live-sessions.module";
import { CryptoGatewayModule } from "./crypto-gateway/crypto-gateway.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MigrationModule } from "./migration/migration.module";
import { GrowthModule } from "./growth/growth.module";
import { TrustModule } from "./trust/trust.module";
import { ObservabilityModule } from "./observability/observability.module";

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    RateLimitModule,
    CacheModule,
    StorageModule,
    AuthModule,
    UsersModule,
    CreatorsModule,
    PostsModule,
    SubscriptionsModule,
    TransactionsModule,
    MessagesModule,
    AiModule,
    ImportModule,
    SchedulingModule,
    AdminModule,
    AnalyticsModule,
    PayoutsModule,
    LiveSessionsModule,
    CryptoGatewayModule,
    NotificationsModule,
    MigrationModule,
    GrowthModule,
    TrustModule,
    ObservabilityModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  // ObservabilityController is registered in ObservabilityModule
  // AppController handles /health endpoint
}

