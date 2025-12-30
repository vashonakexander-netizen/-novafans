import { Controller, Get } from "@nestjs/common";
import { ObservabilityService } from "./observability.service";

@Controller()
export class ObservabilityController {
  constructor(private observabilityService: ObservabilityService) {}

  @Get("metrics")
  async getMetrics() {
    const metrics = await this.observabilityService.getMetrics();
    return metrics;
  }

  @Get("cache/health")
  async getCacheHealth() {
    return this.observabilityService.getCacheHealth();
  }
}


