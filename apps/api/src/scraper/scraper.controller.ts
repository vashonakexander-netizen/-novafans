import { Controller, Post, Get, Body, Param, UseGuards, Headers, Optional, BadRequestException } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { CreateScrapeJobDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("scraper")
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  /**
   * Public scraper endpoint - no authentication required
   * Optionally accepts Authorization header for authenticated users
   */
  @Post("scrape")
  async createScrapeJobPublic(
    @Body() body: any,
    @Headers("authorization") authHeader?: string,
  ) {
    try {
      // If auth header provided, extract user (optional)
      let userId: string | undefined;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          // Simple token extraction - in production, verify JWT properly
          // For now, we'll allow public access
          // userId = extractUserIdFromToken(authHeader.replace("Bearer ", ""));
        } catch (e) {
          // Ignore auth errors, allow public access
        }
      }
      
      // Validate sourceUrl
      if (!body.sourceUrl || typeof body.sourceUrl !== "string") {
        throw new BadRequestException("sourceUrl is required and must be a string");
      }
      
      // Validate and transform body to DTO
      const dto: CreateScrapeJobDto = {
        sourceUrl: body.sourceUrl,
        config: body.config || {},
      };
      
      return this.scraperService.createScrapeJobPublic(dto, userId);
    } catch (error: any) {
      throw new BadRequestException(error.message || "Failed to create scrape job");
    }
  }

  /**
   * Get scrape job status - public access
   */
  @Get("jobs/:importSessionId")
  async getJobStatusPublic(@Param("importSessionId") importSessionId: string) {
    // Public access - no user check needed
    return this.scraperService.getScrapeJobStatusPublic(importSessionId);
  }

  /**
   * Authenticated scraper endpoint (for backward compatibility)
   */
  @Post("creator/scrape")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async createScrapeJob(@CurrentUser() user: any, @Body() dto: CreateScrapeJobDto) {
    return this.scraperService.createScrapeJob(user.id, dto);
  }

  @Get("creator/jobs/:importSessionId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async getJobStatus(@Param("importSessionId") importSessionId: string, @CurrentUser() user: any) {
    return this.scraperService.getScrapeJobStatus(importSessionId, user.id);
  }
}
