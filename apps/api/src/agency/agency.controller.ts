import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UploadedFile, UseInterceptors, Request
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AgencyService } from "./agency.service";
import { AgencyInboxService } from "./agency-inbox.service";
import { AgencyVaultService } from "./agency-vault.service";
import { AgencyAnalyticsService } from "./agency-analytics.service";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("agency")
@UseGuards(JwtAuthGuard)
export class AgencyController {
  constructor(
    private agencyService: AgencyService,
    private inboxService: AgencyInboxService,
    private vaultService: AgencyVaultService,
    private analyticsService: AgencyAnalyticsService,
    private prisma: PrismaService,
  ) {}

  // ── Clients ──────────────────────────────────────────────────────────────

  @Get("clients")
  getClients(@Request() req: any) {
    return this.agencyService.getClients(req.user.id);
  }

  @Get("clients/overview")
  getClientsOverview(@Request() req: any) {
    return this.agencyService.getClientsOverview(req.user.id);
  }

  @Post("clients")
  createClient(@Request() req: any, @Body() dto: any) {
    return this.agencyService.createClient(req.user.id, dto);
  }

  @Get("clients/:id")
  getClient(@Request() req: any, @Param("id") id: string) {
    return this.agencyService.getClient(req.user.id, id);
  }

  @Patch("clients/:id")
  updateClient(@Request() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.agencyService.updateClient(req.user.id, id, dto);
  }

  // ── Stats & Revenue ───────────────────────────────────────────────────────

  @Get("stats")
  getStats(@Request() req: any) {
    return this.agencyService.getAgencyStats(req.user.id);
  }

  @Get("revenue")
  getRevenue(@Request() req: any, @Query("period") period = "monthly") {
    return this.agencyService.getRevenue(req.user.id, period);
  }

  // ── Vault ─────────────────────────────────────────────────────────────────

  @Get("clients/:id/vault")
  getVault(@Request() req: any, @Param("id") clientId: string, @Query("status") status?: string) {
    return this.vaultService.getVault(clientId, status);
  }

  @Post("clients/:id/vault/upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadMedia(
    @Request() req: any,
    @Param("id") clientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("caption") caption?: string,
  ) {
    return this.vaultService.upload(clientId, req.user.id, file, caption);
  }

  @Patch("vault/:mediaId/status")
  updateMediaStatus(@Param("mediaId") mediaId: string, @Body("status") status: string) {
    return this.vaultService.updateStatus(mediaId, status);
  }

  @Post("vault/bulk-approve")
  bulkApprove(@Body("mediaIds") mediaIds: string[]) {
    return this.vaultService.bulkApprove(mediaIds);
  }

  // ── Schedule ──────────────────────────────────────────────────────────────

  @Get("clients/:id/schedule")
  getSchedule(@Param("id") clientId: string, @Query("year") year?: string, @Query("month") month?: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    return this.prisma.agencyScheduledPost.findMany({
      where: { clientId, scheduledAt: { gte: start, lte: end } },
      include: { media: true },
      orderBy: { scheduledAt: "asc" },
    });
  }

  @Post("clients/:id/schedule")
  createScheduledPost(@Request() req: any, @Param("id") clientId: string, @Body() dto: any) {
    return this.prisma.agencyScheduledPost.create({
      data: {
        clientId,
        platform: dto.platform,
        caption: dto.caption,
        scheduledAt: new Date(dto.scheduledAt),
        mediaId: dto.mediaId || null,
        status: "SCHEDULED",
      },
    });
  }

  // ── Inbox ─────────────────────────────────────────────────────────────────

  @Get("clients/:id/inbox")
  getInbox(@Param("id") clientId: string) {
    return this.inboxService.getInbox(clientId);
  }

  @Post("messages/:messageId/generate-draft")
  generateDraft(@Param("messageId") messageId: string) {
    return this.inboxService.generateDraft(messageId);
  }

  @Post("drafts/:draftId/approve")
  approveDraft(@Param("draftId") draftId: string, @Body("content") content: string) {
    return this.inboxService.approveDraft(draftId, content);
  }

  @Post("drafts/:draftId/reject")
  rejectDraft(@Param("draftId") draftId: string) {
    return this.inboxService.rejectDraft(draftId);
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  @Get("templates")
  getTemplates(@Request() req: any) {
    return this.inboxService.getTemplates(req.user.id);
  }

  @Post("templates")
  createTemplate(@Request() req: any, @Body() dto: any) {
    return this.inboxService.createTemplate(req.user.id, dto);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get("clients/:id/analytics")
  getClientAnalytics(@Param("id") clientId: string, @Query("period") period = "weekly") {
    return this.analyticsService.getClientAnalytics(clientId, period);
  }

  // ── Model upload ──────────────────────────────────────────────────────────

  @Get("model/stats")
  getModelStats(@Request() req: any) {
    return this.getModelStatsForUser(req.user.id);
  }

  private async getModelStatsForUser(userId: string) {
    const [totalUploads, totalEarnings] = await Promise.all([
      this.prisma.agencyMediaVault.count({ where: { uploaderId: userId } }),
      Promise.resolve(0),
    ]);
    return { totalUploads, totalEarnings, totalFans: 0 };
  }

  @Get("model/uploads")
  getModelUploads(@Request() req: any) {
    return this.vaultService.getModelUploads(req.user.id);
  }

  @Post("model/upload")
  @UseInterceptors(FileInterceptor("file"))
  async modelUpload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body("caption") caption?: string,
  ) {
    // Model uploads go to the first agency client they're linked to
    // If none, create a standalone vault entry
    const { url: fileUrl } = await this.vaultService["storage"].uploadFile(
      file.buffer,
      file.originalname,
      { folder: `model-uploads/${req.user.id}` },
    );
    return this.prisma.agencyMediaVault.create({
      data: {
        clientId: req.user.agencyClientId || "unassigned",
        uploaderId: req.user.id,
        fileUrl,
        fileType: file.mimetype,
        caption: caption || null,
        tags: [],
        status: "UPLOADED",
      },
    }).catch(async () => {
      // If clientId FK fails, just return the URL
      return { fileUrl, status: "UPLOADED" };
    });
  }
}
