import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class ClipStudioService {
  constructor(private prisma: PrismaService) {}

  // ── Channels ──────────────────────────────────────────────────────────────

  async getChannels(userId: string) {
    return this.prisma.clipChannel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createChannel(userId: string, youtubeUrl: string) {
    // Validate URL is YouTube
    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      throw new Error("Invalid YouTube URL");
    }

    // Parse channel handle/ID from URL
    const channelName = this.extractChannelName(youtubeUrl);

    const channel = await this.prisma.clipChannel.create({
      data: {
        userId,
        youtubeChannelUrl: youtubeUrl,
        channelName,
        status: "INDEXING",
      },
    });

    // TODO: Integrate YouTube Data API v3 to fetch real metadata
    // Set to ACTIVE after metadata fetch completes
    setTimeout(async () => {
      try {
        await this.prisma.clipChannel.update({
          where: { id: channel.id },
          data: {
            status: "ACTIVE",
            channelThumbnail: `https://i.pravatar.cc/150?u=${channel.id}`,
            totalVideosIndexed: Math.floor(Math.random() * 50) + 10,
          },
        });
      } catch (e) {
        // ignore async errors in mock
      }
    }, 3000);

    return channel;
  }

  async deleteChannel(userId: string, channelId: string) {
    const channel = await this.prisma.clipChannel.findFirst({ where: { id: channelId, userId } });
    if (!channel) throw new NotFoundException("Channel not found");
    return this.prisma.clipChannel.delete({ where: { id: channelId } });
  }

  // ── Clips ─────────────────────────────────────────────────────────────────

  async getClips(userId: string, limit = 30) {
    return this.prisma.clip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { posts: true, channel: { select: { channelName: true } } },
    });
  }

  async getClip(userId: string, clipId: string) {
    const clip = await this.prisma.clip.findFirst({
      where: { id: clipId, userId },
      include: { posts: true, earnings: true, channel: true },
    });
    if (!clip) throw new NotFoundException("Clip not found");
    return clip;
  }

  async deleteClip(userId: string, clipId: string) {
    const clip = await this.prisma.clip.findFirst({ where: { id: clipId, userId } });
    if (!clip) throw new NotFoundException("Clip not found");
    return this.prisma.clip.delete({ where: { id: clipId } });
  }

  // ── Social Accounts ───────────────────────────────────────────────────────

  async getSocialAccounts(userId: string) {
    return this.prisma.clipSocialAccount.findMany({ where: { userId } });
  }

  async disconnectSocial(userId: string, platform: string) {
    return this.prisma.clipSocialAccount.deleteMany({
      where: { userId, platform: platform as any },
    });
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(userId: string) {
    const [totalClips, totalChannels, allClips, allPosts] = await Promise.all([
      this.prisma.clip.count({ where: { userId } }),
      this.prisma.clipChannel.count({ where: { userId } }),
      this.prisma.clip.findMany({ where: { userId }, include: { posts: true } }),
      this.prisma.clipPost.findMany({ where: { userId } }),
    ]);

    const totalViews = allPosts.reduce((sum, p) => sum + p.views, 0);
    const totalLikes = allPosts.reduce((sum, p) => sum + p.likes, 0);

    // Watch hours estimate: assume avg 15s clip, view = full watch
    const watchHours = (totalViews * 15) / 3600;

    // Earnings at $1/1000 views default
    const estimatedEarnings = (totalViews / 1000) * 1.0;

    return {
      totalClips,
      totalChannels,
      totalViews,
      totalLikes,
      watchHours: Math.round(watchHours * 10) / 10,
      estimatedEarnings: Math.round(estimatedEarnings * 100) / 100,
      readyClips: allClips.filter((c) => c.status === "READY").length,
      postedClips: allClips.filter((c) => c.status === "POSTED").length,
    };
  }

  private extractChannelName(url: string): string {
    // youtube.com/@handle, youtube.com/c/name, youtube.com/channel/UC...
    const handleMatch = url.match(/youtube\.com\/@([\w-]+)/);
    if (handleMatch) return `@${handleMatch[1]}`;
    const cMatch = url.match(/youtube\.com\/c\/([\w-]+)/);
    if (cMatch) return cMatch[1];
    const channelMatch = url.match(/youtube\.com\/channel\/([\w-]+)/);
    if (channelMatch) return channelMatch[1].slice(0, 12) + "...";
    return "YouTube Channel";
  }
}
