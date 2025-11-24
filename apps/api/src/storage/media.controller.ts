import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("media")
export class MediaController {
  constructor(private storageService: StorageService) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 100 * 1024 * 1024 } })) // 100MB max
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body("context") context?: string
  ) {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Validate mime type (only images and videos)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: images and videos.`);
    }

    // TODO: Add virus scanning integration
    // TODO: Add image/video processing (resize, thumbnail generation, transcoding)

    const folder = context || "general";
    const result = await this.storageService.uploadFile(file.buffer, file.originalname, {
      folder,
    });

    return {
      url: result.url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

