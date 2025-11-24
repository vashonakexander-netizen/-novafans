import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import * as crypto from "crypto";
import * as sharp from "sharp";

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * CSAM Hash Scanning (stub - TODO: Integrate PhotoDNA or similar)
   */
  async scanForCSAM(fileBuffer: Buffer, filename: string): Promise<{
    isSafe: boolean;
    riskScore: number;
    hash?: string;
  }> {
    // Generate hash for the file
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // TODO: Check against PhotoDNA or similar service
    // For now, return safe
    this.logger.log(`CSAM scan for ${filename}: hash=${hash.substring(0, 16)}...`);

    return {
      isSafe: true,
      riskScore: 0,
      hash,
    };
  }

  /**
   * IP-based risk scoring
   */
  async scoreIPRisk(ipAddress: string): Promise<"low" | "medium" | "high"> {
    // TODO: Integrate with IP reputation service
    // For now, return low risk
    this.logger.log(`IP risk score for ${ipAddress}: low`);
    return "low";
  }

  /**
   * Add watermark to image
   */
  async addWatermark(
    imageBuffer: Buffer,
    creatorUsername: string,
    timestamp: Date
  ): Promise<Buffer> {
    try {
      const watermarkText = `NOVAFANS / ${creatorUsername} / ${timestamp.toISOString()}`;

      // Create text overlay using SVG
      const svg = `
        <svg width="400" height="100">
          <text x="10" y="80" font-family="Arial" font-size="20" fill="rgba(255, 255, 255, 0.7)">
            ${watermarkText}
          </text>
        </svg>
      `;
      const svgBuffer = Buffer.from(svg);

      const watermarked = await sharp(imageBuffer)
        .composite([
          {
            input: svgBuffer,
            gravity: "southeast",
            left: 10,
            top: 10,
          },
        ])
        .toBuffer();

      return watermarked;
    } catch (error) {
      this.logger.error(`Failed to add watermark: ${error}`);
      // Return original if watermarking fails
      return imageBuffer;
    }
  }

  /**
   * Report creator
   */
  async reportCreator(
    reporterId: string,
    creatorId: string,
    reason: string,
    details?: string
  ) {
    const report = await this.prisma.creatorReport.create({
      data: {
        reporterId,
        creatorId,
        reason,
        details,
        status: "PENDING",
      },
    });

    this.logger.log(`Creator report created: ${report.id}`);

    // TODO: Notify admins
    // TODO: Auto-flag if multiple reports

    return report;
  }

  /**
   * Get reports for admin review
   */
  async getPendingReports() {
    return this.prisma.creatorReport.findMany({
      where: { status: "PENDING" },
      include: {
        reporter: {
          select: { id: true, username: true, displayName: true },
        },
        creator: {
          select: { id: true, username: true, displayName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Resolve report
   */
  async resolveReport(reportId: string, adminId: string, action: "dismiss" | "warn" | "ban") {
    const report = await this.prisma.creatorReport.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolution: action,
      },
    });

    if (action === "ban") {
      await this.prisma.user.update({
        where: { id: report.creatorId },
        data: { isBanned: true },
      });
    }

    return report;
  }
}

