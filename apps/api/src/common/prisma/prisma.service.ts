import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Don't block app startup - connect asynchronously
    this.$connect().then(() => {
      this.logger.log("Prisma connected successfully");
    }).catch((error: any) => {
      this.logger.warn(`Prisma connection deferred (will connect on first query): ${error.message?.substring(0, 100)}`);
      // Don't throw - app can start without immediate connection
    });
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
  }
}


