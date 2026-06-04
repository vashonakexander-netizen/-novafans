import { Injectable, BadRequestException, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
import { ImportService } from "../import/import.service";
import { CreateScrapeJobDto, ScrapeConfigDto } from "./dto";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs/promises";
import * as path from "path";
import * as bcrypt from "bcrypt";
import { ImportSourceType, ImportSessionStatus } from "@prisma/client";

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private importService: ImportService
  ) {}

  async onModuleInit() {
    // Start worker to process scrape jobs
    this.startScrapeWorker();
    this.logger.log("Scraper worker started");
  }

  private async startScrapeWorker() {
    setInterval(async () => {
      try {
        // Try Redis first, fallback to in-memory queue if Redis unavailable
        let jobData: any = null;
        try {
          jobData = await this.redis.brpop("scrape_jobs", 5);
        } catch (redisError) {
          // Redis not available - use in-memory queue
          if (!(this as any).inMemoryQueue) {
            (this as any).inMemoryQueue = [];
          }
          const queue = (this as any).inMemoryQueue;
          if (queue.length > 0) {
            jobData = [null, queue.shift()];
          }
        }
        
        if (jobData) {
          const [, jobJson] = jobData;
          const job = typeof jobJson === 'string' ? JSON.parse(jobJson) : jobJson;
          await this.processScrapeJob(job);
        }
      } catch (error) {
        this.logger.error("Scrape worker error:", error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Create a new scrape job (public - no auth required)
   * Optionally accepts userId for authenticated users, otherwise uses system user
   */
  async createScrapeJobPublic(dto: CreateScrapeJobDto, userId?: string) {
    try {
      // If userId provided, verify it's a creator
      let finalUserId = userId;
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user || user.role !== "CREATOR") {
          throw new BadRequestException("Only creators can create scrape jobs");
        }
      } else {
        // Find or create a system user for public scraping
        let systemUser = await this.prisma.user.findFirst({
          where: { username: "system_scraper" },
        });
        if (!systemUser) {
          try {
            // Hash password for system user (not used for auth, but required by schema)
            const passwordHash = await bcrypt.hash("system_scraper_password_not_used", 10);
            systemUser = await this.prisma.user.create({
              data: {
                username: "system_scraper",
                email: "system@scraper.local",
                passwordHash,
                displayName: "System Scraper",
                role: "CREATOR",
                ageVerified: true,
                tosAccepted: true,
                privacyAccepted: true,
              },
            });
            // Create creator profile for system user
            await this.prisma.creatorProfile.create({
              data: {
                userId: systemUser.id,
                isActive: true,
              },
            });
            this.logger.log("Created system_scraper user for public scraping");
          } catch (createError: any) {
            this.logger.error(`Failed to create system user: ${createError.message}`, createError.stack);
            throw new BadRequestException(`Failed to initialize scraper: ${createError.message}`);
          }
        }
        finalUserId = systemUser.id;
      }

      // Create import session
      const importSession = await this.importService.createImportSession(finalUserId, {
        sourceType: ImportSourceType.REMOTE,
        sourceUrl: dto.sourceUrl,
      });

      // Push scrape job to queue
      const jobData = {
        userId: finalUserId,
        importSessionId: importSession.id,
        sourceUrl: dto.sourceUrl,
        config: dto.config || {},
      };

      try {
        await this.redis.lpush("scrape_jobs", JSON.stringify(jobData));
      } catch (redisError) {
        // Redis not available - use in-memory queue
        if (!(this as any).inMemoryQueue) {
          (this as any).inMemoryQueue = [];
        }
        (this as any).inMemoryQueue.push(JSON.stringify(jobData));
        this.logger.warn("Using in-memory queue (Redis unavailable)");
      }

      return {
        jobId: importSession.id,
        importSessionId: importSession.id,
        status: "queued",
        message: "Scrape job queued for processing",
      };
    } catch (error: any) {
      this.logger.error(`Error creating scrape job: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || "Failed to create scrape job");
    }
  }

  /**
   * Create a new scrape job (authenticated)
   */
  async createScrapeJob(userId: string, dto: CreateScrapeJobDto) {
    return this.createScrapeJobPublic(dto, userId);
  }

  /**
   * Process a scrape job from the queue
   */
  private async processScrapeJob(job: {
    userId: string;
    importSessionId: string;
    sourceUrl: string;
    config: ScrapeConfigDto;
  }) {
    this.logger.log(`Processing scrape job for session ${job.importSessionId}`);

    try {
      // Verify import session still exists and is pending
      const session = await this.prisma.importSession.findUnique({
        where: { id: job.importSessionId },
        include: { creator: true },
      });

      if (!session || session.status !== ImportSessionStatus.PENDING) {
        this.logger.warn(`Session ${job.importSessionId} not found or not pending`);
        return;
      }

      // Fetch and scrape the source URL
      const mediaItems = await this.scrapeMedia(job.sourceUrl, job.config);

      if (mediaItems.length === 0) {
        this.logger.warn(`No media found at ${job.sourceUrl}`);
        await this.prisma.importSession.update({
          where: { id: job.importSessionId },
          data: { status: ImportSessionStatus.CANCELED },
        });
        return;
      }

      // Download media files and add to import session
      const downloadPromises = mediaItems.map(async (item) => {
        try {
          const downloadedUrl = await this.downloadMedia(item.url, item.filename);
          return {
            tempFileUrl: downloadedUrl,
            mediaType: item.type,
            originalFilename: item.filename || path.basename(item.url),
          };
        } catch (error) {
          this.logger.error(`Failed to download ${item.url}:`, error);
          return null;
        }
      });

      const downloadedMedia = (await Promise.all(downloadPromises)).filter(Boolean);

      // Add files to import session
      if (downloadedMedia.length > 0) {
        await this.importService.addFiles(job.importSessionId, job.userId, {
          files: downloadedMedia as any,
        });

        // Mark session as ready
        await this.prisma.importSession.update({
          where: { id: job.importSessionId },
          data: {
            status: ImportSessionStatus.READY,
            totalFiles: downloadedMedia.length,
          },
        });

        this.logger.log(
          `Scrape job completed: ${downloadedMedia.length} media items scraped for session ${job.importSessionId}`
        );

        // Auto-commit to posts (one video/image per post, public visibility)
        try {
          const commitResult = await this.importService.commit(job.importSessionId, job.userId, {
            groupSize: 1, // One media item per post
            visibility: "PUBLIC_TEASER" as any, // Make posts public so they appear on browse page
            scheduleMode: "NOW", // Publish immediately
          });
          this.logger.log(
            `Auto-committed ${commitResult.postsCreated} posts from scrape session ${job.importSessionId}`
          );
        } catch (commitError) {
          this.logger.error(`Failed to auto-commit scrape session ${job.importSessionId}:`, commitError);
          // Don't fail the scrape job if commit fails - media is still available for manual commit
        }
      } else {
        throw new Error("No media items were successfully downloaded");
      }
    } catch (error) {
      this.logger.error(`Error processing scrape job:`, error);
      await this.prisma.importSession.update({
        where: { id: job.importSessionId },
        data: { status: ImportSessionStatus.CANCELED },
      });
    }
  }

  /**
   * Scrape media from a URL
   */
  private async scrapeMedia(sourceUrl: string, config: ScrapeConfigDto): Promise<
    Array<{
      url: string;
      filename?: string;
      type: "IMAGE" | "VIDEO";
    }>
  > {
    try {
      // Fetch the HTML page with configurable headers
      const urlObj = new URL(sourceUrl);
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Referer: urlObj.origin + "/",
        Origin: urlObj.origin,
      };

      // Add custom headers from config if provided
      if (config.apiHeaders) {
        Object.assign(headers, config.apiHeaders);
      }

      const response = await axios.get(sourceUrl, {
        headers,
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const $ = cheerio.load(response.data);
      const mediaItems: Array<{ url: string; filename?: string; type: "IMAGE" | "VIDEO" }> = [];

      // Extract base URL for resolving relative URLs
      const baseUrl = new URL(sourceUrl).origin;

      // Default selectors if not provided - comprehensive selectors for images and videos
      const imageSelector =
        config.imageSelector ||
        "img[src], img[data-src], img[data-lazy-src], img.gallery-image, img.media-image, img.photo, img.picture, .image img, .photo img, .gallery img";
      const videoSelector =
        config.videoSelector ||
        "video[src], video source[src], video[data-src], .video video, .media video, iframe[src*='youtube'], iframe[src*='vimeo'], iframe[src*='video']";

      // Scrape images
      $(imageSelector).each((_, element) => {
        const imgSrc = $(element).attr("src") || $(element).attr("data-src") || $(element).attr("data-lazy-src");
        if (imgSrc) {
          const absoluteUrl = new URL(imgSrc, baseUrl).href;
          // Filter out common non-media images
          // Also check if URL looks like an image (has image extension)
          const isImageUrl =
            /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(absoluteUrl) ||
            !absoluteUrl.includes("logo") &&
            !absoluteUrl.includes("icon") &&
            !absoluteUrl.includes("avatar");

          const imgWidth = parseInt($(element).attr("width") || "0");
          const imgHeight = parseInt($(element).attr("height") || "0");
          const meetsSizeRequirement =
            !config.minImageSize || imgWidth >= (config.minImageSize || 0) || imgHeight >= (config.minImageSize || 0);

          if (isImageUrl && meetsSizeRequirement) {
            mediaItems.push({
              url: absoluteUrl,
              type: "IMAGE",
            });
          }
        }
      });

      // Scrape videos
      $(videoSelector).each((_, element) => {
        // Handle video elements
        if ($(element).is("video")) {
          const videoSrc = $(element).attr("src") || $(element).attr("data-src");
          if (videoSrc) {
            const absoluteUrl = new URL(videoSrc, baseUrl).href;
            mediaItems.push({
              url: absoluteUrl,
              type: "VIDEO",
            });
          }
          // Check for source tags inside video
          $(element)
            .find("source")
            .each((_, source) => {
              const sourceSrc = $(source).attr("src");
              if (sourceSrc) {
                const absoluteUrl = new URL(sourceSrc, baseUrl).href;
                mediaItems.push({
                  url: absoluteUrl,
                  type: "VIDEO",
                });
              }
            });
        }
        // Handle source elements
        else if ($(element).is("source")) {
          const sourceSrc = $(element).attr("src");
          if (sourceSrc) {
            const absoluteUrl = new URL(sourceSrc, baseUrl).href;
            // Check if it's a video file
            if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(absoluteUrl)) {
              mediaItems.push({
                url: absoluteUrl,
                type: "VIDEO",
              });
            }
          }
        }
        // Handle iframes (YouTube, Vimeo, etc.)
        else if ($(element).is("iframe")) {
          const iframeSrc = $(element).attr("src");
          if (iframeSrc && (iframeSrc.includes("youtube") || iframeSrc.includes("vimeo") || iframeSrc.includes("video"))) {
            mediaItems.push({
              url: iframeSrc,
              type: "VIDEO",
            });
          }
        }
      });

      // If custom extractor is provided (e.g., for API-based sites)
      if (config.useApi && config.apiEndpoint) {
        const apiMedia = await this.scrapeFromApi(sourceUrl, config);
        mediaItems.push(...apiMedia);
      }

      // Also look for direct video URLs in script tags or data attributes
      // (Some sites load video URLs via JavaScript)
      $("script").each((_, script) => {
        const scriptContent = $(script).html() || "";
        // Look for video URLs in JavaScript - multiple patterns
        const videoUrlPatterns = [
          /https?:\/\/[^\s"']+\.mp4[^\s"']*/gi, // General .mp4 URLs
          /https?:\/\/[^\s"']+\.sdu\.sdx-sdx\.com\/[^\s"']+\.mp4[^\s"']*/gi, // toflx.com CDN pattern
          /https?:\/\/[^\s"']+\.webm[^\s"']*/gi, // WebM videos
          /https?:\/\/[^\s"']+\.mov[^\s"']*/gi, // MOV videos
        ];
        
        videoUrlPatterns.forEach((pattern) => {
          const matches = scriptContent.match(pattern);
          if (matches) {
            matches.forEach((url) => {
              // Clean up URL (remove trailing characters)
              const cleanUrl = url.replace(/[;,\)\]\}]/g, "").trim();
              if (!cleanUrl.includes("logo") && !cleanUrl.includes("icon") && cleanUrl.length > 10) {
                mediaItems.push({
                  url: cleanUrl,
                  type: "VIDEO",
                });
              }
            });
          }
        });
      });

      // Look for data attributes that might contain video URLs
      $("[data-video], [data-src-video], [data-url]").each((_, element) => {
        const videoUrl =
          $(element).attr("data-video") || $(element).attr("data-src-video") || $(element).attr("data-url");
        if (videoUrl && /\.mp4|video|\.webm/i.test(videoUrl)) {
          const absoluteUrl = new URL(videoUrl, baseUrl).href;
          mediaItems.push({
            url: absoluteUrl,
            type: "VIDEO",
          });
        }
      });

      // Remove duplicates
      const uniqueUrls = new Set<string>();
      const uniqueMedia = mediaItems.filter((item) => {
        // Normalize URL (remove query params for comparison)
        const normalizedUrl = item.url.split("?")[0];
        if (uniqueUrls.has(normalizedUrl)) {
          return false;
        }
        uniqueUrls.add(normalizedUrl);
        return true;
      });

      return uniqueMedia;
    } catch (error: any) {
      this.logger.error(`Error scraping ${sourceUrl}:`, error);
      throw new Error(`Failed to scrape media: ${error?.message || String(error)}`);
    }
  }

  /**
   * Scrape media from an API endpoint
   */
  private async scrapeFromApi(sourceUrl: string, config: ScrapeConfigDto): Promise<
    Array<{
      url: string;
      filename?: string;
      type: "IMAGE" | "VIDEO";
    }>
  > {
    try {
      const apiUrl = config.apiEndpoint || sourceUrl;
      const response = await axios.get(apiUrl, {
        headers: config.apiHeaders || {},
        params: config.apiParams || {},
      });

      const mediaItems: Array<{ url: string; filename?: string; type: "IMAGE" | "VIDEO" }> = [];

      // Parse API response based on config
      const data = response.data;
      const mediaPath = config.apiMediaPath || "media";

      // Simple JSON path traversal (can be enhanced)
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const mediaUrl = this.getNestedValue(item, mediaPath);
          if (mediaUrl) {
            mediaItems.push({
              url: mediaUrl,
              type: mediaUrl.match(/\.(mp4|webm|mov)$/i) ? "VIDEO" : "IMAGE",
            });
          }
        });
      } else if (typeof data === "object") {
        const mediaUrl = this.getNestedValue(data, mediaPath);
        if (mediaUrl) {
          mediaItems.push({
            url: mediaUrl,
            type: mediaUrl.match(/\.(mp4|webm|mov)$/i) ? "VIDEO" : "IMAGE",
          });
        }
      }

      return mediaItems;
    } catch (error) {
      this.logger.error(`Error scraping from API:`, error);
      return [];
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | null {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return typeof value === "string" ? value : null;
  }

  /**
   * Download a media file and return the stored URL
   * In production, this would upload to S3/storage service
   */
  private async downloadMedia(url: string, filename?: string): Promise<string> {
    try {
      // For now, we'll return the original URL
      // In production, download the file and upload to your storage service (S3, etc.)
      // Then return the storage URL

      // TODO: Implement actual file download and storage
      // const response = await axios.get(url, { responseType: 'stream' });
      // const filePath = path.join(process.cwd(), 'temp', filename || path.basename(url));
      // await fs.mkdir(path.dirname(filePath), { recursive: true });
      // const writer = fs.createWriteStream(filePath);
      // response.data.pipe(writer);
      // await new Promise((resolve, reject) => {
      //   writer.on('finish', resolve);
      //   writer.on('error', reject);
      // });
      // Then upload to S3 and return S3 URL

      // For now, return the original URL as tempFileUrl
      // The import service will handle the actual processing
      return url;
    } catch (error) {
      this.logger.error(`Error downloading media ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get scrape job status (public)
   */
  async getScrapeJobStatusPublic(importSessionId: string) {
    const session = await this.prisma.importSession.findUnique({
      where: { id: importSessionId },
      include: {
        media: {
          take: 10,
        },
      },
    });

    if (!session) {
      throw new BadRequestException("Import session not found");
    }

    return {
      sessionId: session.id,
      status: session.status,
      totalFiles: session.totalFiles,
      mediaCount: session.media.length,
      sourceUrl: session.sourceUrl,
      createdAt: session.createdAt,
      media: session.media,
    };
  }

  /**
   * Get scrape job status (authenticated)
   */
  async getScrapeJobStatus(importSessionId: string, userId: string) {
    const result = await this.getScrapeJobStatusPublic(importSessionId);
    
    // Verify ownership
    const session = await this.prisma.importSession.findUnique({
      where: { id: importSessionId },
    });
    
    if (session && session.creatorId !== userId) {
      throw new BadRequestException("Access denied");
    }

    return result;
  }
}
