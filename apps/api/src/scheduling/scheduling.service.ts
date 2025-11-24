import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { PostStatus } from "@prisma/client";

@Injectable()
export class SchedulingService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Start scheduler worker
    this.startSchedulerWorker();
  }

  private async startSchedulerWorker() {
    console.log("Scheduler Worker started");

    setInterval(async () => {
      try {
        const now = new Date();

        // Find scheduled posts that should be published
        const postsToPublish = await this.prisma.post.findMany({
          where: {
            status: PostStatus.SCHEDULED,
            publishAt: {
              lte: now,
            },
          },
        });

        for (const post of postsToPublish) {
          await this.prisma.post.update({
            where: { id: post.id },
            data: {
              status: PostStatus.PUBLISHED,
              publishAt: null,
            },
          });

          console.log(`Published post ${post.id}`);
        }
      } catch (error) {
        console.error("Scheduler Worker error:", error);
      }
    }, 60000); // Check every minute
  }

  async schedulePost(postId: string, publishAt: Date) {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.SCHEDULED,
        publishAt,
      },
    });
  }

  async publishNow(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishAt: null,
      },
    });
  }

  async getScheduledPosts(creatorId: string) {
    return this.prisma.post.findMany({
      where: {
        creatorId,
        status: PostStatus.SCHEDULED,
      },
      include: {
        media: {
          take: 1,
        },
      },
      orderBy: {
        publishAt: "asc",
      },
    });
  }
}

