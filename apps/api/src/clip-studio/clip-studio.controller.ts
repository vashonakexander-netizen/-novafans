import {
  Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ClipStudioService } from "./clip-studio.service";
import { ClipProcessingService } from "./clip-processing.service";
import { ClipPostingService } from "./clip-posting.service";

@Controller("clip-studio")
@UseGuards(JwtAuthGuard)
export class ClipStudioController {
  constructor(
    private clipStudio: ClipStudioService,
    private processing: ClipProcessingService,
    private posting: ClipPostingService,
  ) {}

  // ── Channels ──────────────────────────────────────────────────────────────

  @Get("channels")
  getChannels(@Request() req: any) {
    return this.clipStudio.getChannels(req.user.id);
  }

  @Post("channels")
  createChannel(@Request() req: any, @Body() body: { youtube_channel_url: string }) {
    return this.clipStudio.createChannel(req.user.id, body.youtube_channel_url);
  }

  @Delete("channels/:id")
  deleteChannel(@Request() req: any, @Param("id") id: string) {
    return this.clipStudio.deleteChannel(req.user.id, id);
  }

  // ── Process ───────────────────────────────────────────────────────────────

  @Post("process")
  async processVideo(@Request() req: any, @Body() body: { channel_id: string; video_url: string }) {
    return this.processing.processVideo(req.user.id, body.channel_id, body.video_url);
  }

  // ── Clips ─────────────────────────────────────────────────────────────────

  @Get("clips")
  getClips(@Request() req: any, @Query("limit") limit?: string) {
    return this.clipStudio.getClips(req.user.id, limit ? parseInt(limit, 10) : 30);
  }

  @Get("clips/:id")
  getClip(@Request() req: any, @Param("id") id: string) {
    return this.clipStudio.getClip(req.user.id, id);
  }

  @Delete("clips/:id")
  deleteClip(@Request() req: any, @Param("id") id: string) {
    return this.clipStudio.deleteClip(req.user.id, id);
  }

  // ── Posting ───────────────────────────────────────────────────────────────

  @Post("post")
  postClip(@Request() req: any, @Body() body: { clip_id: string; platforms: string[] }) {
    return this.posting.postClip(req.user.id, body.clip_id, body.platforms);
  }

  // ── Social Accounts ───────────────────────────────────────────────────────

  @Get("socials")
  getSocials(@Request() req: any) {
    return this.clipStudio.getSocialAccounts(req.user.id);
  }

  @Delete("socials/:platform")
  disconnectSocial(@Request() req: any, @Param("platform") platform: string) {
    return this.clipStudio.disconnectSocial(req.user.id, platform);
  }

  // OAuth callback stubs — frontend redirects here after platform consent.
  // TODO: implement real OAuth token exchange per platform.
  @Get("oauth/:platform/callback")
  oauthCallback(@Param("platform") platform: string, @Query("code") code: string) {
    return { platform, code, status: "stub — implement OAuth exchange" };
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get("analytics")
  async getAnalytics(@Request() req: any) {
    // Refresh metrics first (mock — would hit real platform APIs)
    await this.posting.refreshAnalytics(req.user.id);
    return this.clipStudio.getAnalytics(req.user.id);
  }
}
