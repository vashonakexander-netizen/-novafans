import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

/**
 * ClipPostingService — pushes a finished clip to TikTok, Instagram Reels,
 * and/or YouTube Shorts.
 *
 * Production state requires:
 *   - TikTok Content Posting API v2 (requires Meta-style app review)
 *   - Instagram Graph API (requires Business account + Meta app review)
 *   - YouTube Data API v3 (requires OAuth + verification for production scope)
 *
 * Current state: this service creates ClipPost rows in QUEUED status,
 * then transitions them to POSTED after a delay with simulated metrics.
 * When real social credentials are wired in (ClipSocialAccount table),
 * swap the `mockPost` body for the real API call.
 */
@Injectable()
export class ClipPostingService {
  private readonly logger = new Logger(ClipPostingService.name);

  constructor(private prisma: PrismaService) {}

  async postClip(userId: string, clipId: string, platforms: string[]) {
    const clip = await this.prisma.clip.findFirst({ where: { id: clipId, userId } });
    if (!clip) throw new Error("Clip not found");

    const results = [];
    for (const platform of platforms) {
      const platformEnum = this.normalizePlatform(platform);
      if (!platformEnum) continue;

      // Check if user has a connected account for this platform
      const account = await this.prisma.clipSocialAccount.findFirst({
        where: { userId, platform: platformEnum as any },
      });

      const post = await this.prisma.clipPost.create({
        data: {
          clipId,
          userId,
          platform: platformEnum as any,
          postStatus: account ? "QUEUED" : "FAILED",
        },
      });

      if (account) {
        // Real platform call would go here. For now, simulate success after 3s.
        setTimeout(async () => {
          try {
            await this.prisma.clipPost.update({
              where: { id: post.id },
              data: {
                postStatus: "POSTED",
                postedAt: new Date(),
                externalPostId: `mock_${Math.random().toString(36).slice(2, 12)}`,
                externalUrl: this.fakeExternalUrl(platformEnum, post.id),
                views: Math.floor(Math.random() * 5000) + 100,
                likes: Math.floor(Math.random() * 300) + 10,
              },
            });
          } catch (e) { /* ignore */ }
        }, 3000);
      }

      results.push({ platform, status: account ? "queued" : "no_account_connected", postId: post.id });
    }

    // Update clip status if at least one post was queued
    if (results.some((r) => r.status === "queued")) {
      await this.prisma.clip.update({ where: { id: clipId }, data: { status: "POSTED" } });
    }

    return results;
  }

  async refreshAnalytics(userId: string) {
    // Mock — in production, call each platform API to refresh real metrics
    const posts = await this.prisma.clipPost.findMany({
      where: { userId, postStatus: "POSTED" },
    });

    for (const post of posts) {
      // Simulate small growth
      const newViews = post.views + Math.floor(Math.random() * 50);
      const newLikes = post.likes + Math.floor(Math.random() * 5);
      await this.prisma.clipPost.update({
        where: { id: post.id },
        data: { views: newViews, likes: newLikes },
      });

      // Update earnings tracker
      const earningsUsd = (newViews / 1000) * 1.0;
      await this.prisma.clipEarning.upsert({
        where: { id: `earning-${post.id}` },
        update: { totalViews: newViews, earningsUsd },
        create: {
          id: `earning-${post.id}`,
          clipId: post.clipId,
          userId,
          platform: post.platform,
          totalViews: newViews,
          earningsUsd,
        },
      }).catch(() => {});
    }

    return { refreshed: posts.length };
  }

  private normalizePlatform(p: string): string | null {
    const map: Record<string, string> = {
      tiktok: "TIKTOK",
      instagram: "INSTAGRAM",
      youtube_shorts: "YOUTUBE_SHORTS",
      "youtube-shorts": "YOUTUBE_SHORTS",
      youtube: "YOUTUBE_SHORTS",
    };
    return map[p.toLowerCase()] || null;
  }

  private fakeExternalUrl(platform: string, postId: string): string {
    const slug = postId.slice(0, 10);
    if (platform === "TIKTOK") return `https://tiktok.com/@user/video/${slug}`;
    if (platform === "INSTAGRAM") return `https://instagram.com/reel/${slug}`;
    return `https://youtube.com/shorts/${slug}`;
  }
}
