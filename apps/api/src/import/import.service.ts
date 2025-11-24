import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
import { SchedulingService } from "../scheduling/scheduling.service";
import {
  CreateImportSessionDto,
  AddImportFilesDto,
  CommitImportSessionDto,
} from "./dto";
import { ImportSessionStatus, ImportSourceType, PostVisibility, MediaType, PostStatus } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
const axios = require("axios");

@Injectable()
export class ImportService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private schedulingService: SchedulingService
  ) {}

  async onModuleInit() {
    // Start worker to process remote import jobs
    this.startRemoteImportWorker();
  }

  private async startRemoteImportWorker() {
    console.log("Remote Import Worker started");

    setInterval(async () => {
      try {
        const jobData = await this.redis.brpop("remote_import_jobs", 5);
        if (jobData) {
          const [, jobJson] = jobData;
          const job = JSON.parse(jobJson);
          await this.processRemoteImportJob(job);
        }
      } catch (error) {
        console.error("Remote Import Worker error:", error);
      }
    }, 5000); // Check every 5 seconds
  }

  private async processRemoteImportJob(job: { importSessionId: string; sourceUrl: string }) {
    try {
      const session = await this.prisma.importSession.findUnique({
        where: { id: job.importSessionId },
        include: { creator: true },
      });

      if (!session || session.status !== ImportSessionStatus.PENDING) {
        return;
      }

      // Download and extract (simplified - in production, use proper ZIP extraction)
      console.log(`Downloading from ${job.sourceUrl}...`);

      // For now, we'll simulate the download by creating placeholder media
      // In production, you would:
      // 1. Download the file from URL
      // 2. Extract if ZIP
      // 3. Save files to storage (S3, etc.)
      // 4. Create ImportMedia records

      // Simulate: create a few placeholder media items
      const tempMedia = [
        { url: `${job.sourceUrl}/file1.jpg`, type: MediaType.IMAGE, name: "file1.jpg" },
        { url: `${job.sourceUrl}/file2.jpg`, type: MediaType.IMAGE, name: "file2.jpg" },
        { url: `${job.sourceUrl}/video1.mp4`, type: MediaType.VIDEO, name: "video1.mp4" },
      ];

      for (const media of tempMedia) {
        await this.prisma.importMedia.create({
          data: {
            importSessionId: session.id,
            creatorId: session.creatorId,
            tempFileUrl: media.url,
            mediaType: media.type,
            originalFilename: media.name,
          },
        });
      }

      // Update session status
      await this.prisma.importSession.update({
        where: { id: session.id },
        data: {
          status: ImportSessionStatus.READY,
          totalFiles: tempMedia.length,
        },
      });

      console.log(`Remote import completed for session ${session.id}`);
    } catch (error) {
      console.error("Error processing remote import job:", error);
      await this.prisma.importSession.update({
        where: { id: job.importSessionId },
        data: { status: ImportSessionStatus.CANCELED },
      });
    }
  }

  async createImportSession(userId: string, dto: CreateImportSessionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "CREATOR") {
      throw new ForbiddenException("Not a creator");
    }

    const session = await this.prisma.importSession.create({
      data: {
        creatorId: userId,
        sourceType: dto.sourceType,
        sourceUrl: dto.sourceUrl,
        status: ImportSessionStatus.PENDING,
      },
    });

    // If remote, push to queue
    if (dto.sourceType === ImportSourceType.REMOTE && dto.sourceUrl) {
      await this.redis.lpush(
        "remote_import_jobs",
        JSON.stringify({
          importSessionId: session.id,
          sourceUrl: dto.sourceUrl,
        })
      );
    }

    return session;
  }

  async addFiles(sessionId: string, userId: string, dto: AddImportFilesDto) {
    const session = await this.prisma.importSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Import session not found");
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (session.status !== ImportSessionStatus.PENDING) {
      throw new ForbiddenException("Session is not pending");
    }

    // Create import media records
    const mediaRecords = dto.files.map((file) => ({
      importSessionId: session.id,
      creatorId: userId,
      tempFileUrl: file.tempFileUrl,
      mediaType: file.mediaType,
      originalFilename: file.originalFilename || "unnamed",
    }));

    await this.prisma.importMedia.createMany({
      data: mediaRecords,
    });

    // Update session
    const totalFiles = await this.prisma.importMedia.count({
      where: { importSessionId: session.id },
    });

    await this.prisma.importSession.update({
      where: { id: sessionId },
      data: { totalFiles },
    });

    return { success: true, totalFiles };
  }

  async getPreview(sessionId: string, userId: string) {
    const session = await this.prisma.importSession.findUnique({
      where: { id: sessionId },
      include: {
        media: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Import session not found");
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    return session;
  }

  async commit(sessionId: string, userId: string, dto: CommitImportSessionDto) {
    const session = await this.prisma.importSession.findUnique({
      where: { id: sessionId },
      include: {
        media: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Import session not found");
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (session.status !== ImportSessionStatus.READY) {
      throw new ForbiddenException("Session is not ready");
    }

    const {
      groupSize = 1,
      visibility = PostVisibility.PUBLIC_TEASER,
      price,
      titleTemplate = "Post {index}",
      scheduleMode = "NOW",
      startAt,
      intervalHours = 24,
      jitterMinutes = 0,
    } = dto;

    // Group media into posts
    const mediaGroups: (typeof session.media)[] = [];
    for (let i = 0; i < session.media.length; i += groupSize) {
      mediaGroups.push(session.media.slice(i, i + groupSize));
    }

    const posts = [];

    for (let i = 0; i < mediaGroups.length; i++) {
      const mediaGroup = mediaGroups[i];
      const title = titleTemplate.replace("{index}", String(i + 1));

      let publishAt: Date | null = null;
      let status: PostStatus = PostStatus.DRAFT;

      if (scheduleMode === "NOW") {
        status = PostStatus.PUBLISHED;
      } else if (scheduleMode === "DRIP" && startAt) {
        const startTime = new Date(startAt);
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const jitterMs = jitterMinutes * 60 * 1000;
        const jitter = Math.floor(Math.random() * jitterMs * 2) - jitterMs;
        publishAt = new Date(startTime.getTime() + i * intervalMs + jitter);
        status = PostStatus.SCHEDULED;
      }

      const post = await this.prisma.post.create({
        data: {
          creatorId: userId,
          title,
          visibility,
          price: price ? Number(price) : null,
          status,
          publishAt,
        },
      });

      // Create post media
      for (const media of mediaGroup) {
        await this.prisma.postMedia.create({
          data: {
            postId: post.id,
            fileUrl: media.tempFileUrl,
            mediaType: media.mediaType,
          },
        });
      }

      posts.push(post);

      // If scheduled, register with scheduler
      if (status === PostStatus.SCHEDULED && publishAt) {
        await this.schedulingService.schedulePost(post.id, publishAt);
      }
    }

    // Mark session as committed
    await this.prisma.importSession.update({
      where: { id: sessionId },
      data: { status: ImportSessionStatus.COMMITTED },
    });

    return { success: true, postsCreated: posts.length, posts };
  }

  async cancel(sessionId: string, userId: string) {
    const session = await this.prisma.importSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Import session not found");
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    await this.prisma.importSession.update({
      where: { id: sessionId },
      data: { status: ImportSessionStatus.CANCELED },
    });

    // Clean up media (in production, delete files from storage)
    await this.prisma.importMedia.deleteMany({
      where: { importSessionId: sessionId },
    });

    return { success: true };
  }

  async getMyImportSessions(userId: string) {
    const sessions = await this.prisma.importSession.findMany({
      where: { creatorId: userId },
      include: {
        media: {
          take: 5, // Preview
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return sessions;
  }
}

