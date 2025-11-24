import { Injectable, Logger } from "@nestjs/common";
import { GrowthService } from "./growth.service";

// GrowthProcessor - Optional BullMQ processor
// If BullMQ is not configured, growth jobs can be triggered manually
@Injectable()
export class GrowthProcessor {
  private readonly logger = new Logger(GrowthProcessor.name);

  constructor(private growthService: GrowthService) {}

  async processJob(jobName: string, jobData: any) {
    this.logger.log(`Processing growth job: ${jobName}`);

    switch (jobName) {
      case "new-creator":
        await this.growthService.processNewCreator(jobData.creatorId);
        break;
      case "weekly-summary":
        await this.growthService.sendWeeklySummary(jobData.creatorId);
        break;
      case "retention-nudge":
        await this.growthService.sendRetentionNudge(jobData.creatorId);
        break;
      case "subscription-expiry":
        await this.growthService.sendSubscriptionExpiryReminder(
          jobData.fanId,
          jobData.creatorId
        );
        break;
      default:
        this.logger.warn(`Unknown job type: ${jobName}`);
    }
  }
}

