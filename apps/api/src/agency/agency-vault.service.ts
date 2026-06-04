import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class AgencyVaultService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async getVault(clientId: string, status?: string) {
    return this.prisma.agencyMediaVault.findMany({
      where: { clientId, ...(status && status !== "ALL" ? { status: status as any } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async upload(clientId: string, uploaderId: string, file: Express.Multer.File, caption?: string) {
    const { url: fileUrl } = await this.storage.uploadFile(file.buffer, file.originalname, { folder: `agency/${clientId}` });
    return this.prisma.agencyMediaVault.create({
      data: {
        clientId,
        uploaderId,
        fileUrl,
        fileType: file.mimetype,
        caption: caption || null,
        tags: [],
        status: "UPLOADED",
      },
    });
  }

  async updateStatus(mediaId: string, status: string) {
    return this.prisma.agencyMediaVault.update({ where: { id: mediaId }, data: { status: status as any } });
  }

  async bulkApprove(mediaIds: string[]) {
    return this.prisma.agencyMediaVault.updateMany({ where: { id: { in: mediaIds } }, data: { status: "APPROVED" } });
  }

  async getModelUploads(uploaderId: string) {
    return this.prisma.agencyMediaVault.findMany({
      where: { uploaderId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
}
