import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import * as fs from "fs/promises";
import { readFileSync } from "fs";
import * as path from "path";
import * as AdmZip from "adm-zip";
import axios from "axios";

export interface MigrationImportDto {
  source: "onlyfans" | "fanvue";
  files?: Express.Multer.File[];
  remoteUrl?: string;
  mappingStrategy: "drip" | "publish";
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async importFromZip(
    creatorId: string,
    zipFile: Buffer,
    source: "onlyfans" | "fanvue",
    mappingStrategy: "drip" | "publish"
  ) {
    const tempDir = path.join(process.cwd(), "temp", `migration_${creatorId}_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Extract ZIP
      const zip = new AdmZip(zipFile);
      zip.extractAllTo(tempDir, true);

      // Scan for media files
      const mediaFiles = await this.scanForMedia(tempDir);

      // Map files to posts based on source structure
      const posts = this.mapFilesToPosts(mediaFiles, source);

      // Create posts
      const createdPosts = [];
      for (const post of posts) {
        const createdPost = await this.createPostFromMigration(creatorId, post, mappingStrategy);
        createdPosts.push(createdPost);
      }

      this.logger.log(`Imported ${createdPosts.length} posts for creator ${creatorId}`);

      return {
        success: true,
        postsCreated: createdPosts.length,
        posts: createdPosts,
      };
    } finally {
      // Cleanup temp directory
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async importFromRemoteUrl(
    creatorId: string,
    url: string,
    source: "onlyfans" | "fanvue",
    mappingStrategy: "drip" | "publish"
  ) {
    // Download from remote URL (MEGA, Google Drive, etc.)
    // TODO: Implement MEGA/Drive download logic
    this.logger.warn("Remote URL import not yet implemented");
    throw new BadRequestException("Remote URL import not yet implemented. Please use ZIP upload.");
  }

  private async scanForMedia(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.scanForMedia(fullPath);
        files.push(...subFiles);
      } else if (this.isMediaFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isMediaFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov"].includes(ext);
  }

  private mapFilesToPosts(files: string[], source: "onlyfans" | "fanvue"): Array<{
    title?: string;
    body?: string;
    mediaFiles: string[];
    createdAt?: Date;
  }> {
    // Simple mapping: group files by directory or create one post per file
    // TODO: Implement source-specific mapping logic
    // For now, create one post per file or group by directory

    const posts: Array<{ title?: string; body?: string; mediaFiles: string[]; createdAt?: Date }> = [];

    if (source === "onlyfans") {
      // OnlyFans structure: typically one media file per post
      // Try to find captions in .txt files with same name
      for (const file of files) {
        const dir = path.dirname(file);
        const basename = path.basename(file, path.extname(file));
        const captionFile = path.join(dir, `${basename}.txt`);

        let caption: string | undefined;
        try {
          caption = readFileSync(captionFile, "utf-8");
        } catch {
          // No caption file
        }

        posts.push({
          title: caption ? caption.substring(0, 100) : undefined,
          body: caption,
          mediaFiles: [file],
        });
      }
    } else {
      // Fanvue: similar structure
      for (const file of files) {
        posts.push({
          mediaFiles: [file],
        });
      }
    }

    return posts;
  }

  private async createPostFromMigration(
    creatorId: string,
    postData: { title?: string; body?: string; mediaFiles: string[]; createdAt?: Date },
    mappingStrategy: "drip" | "publish"
  ) {
    // Upload media files
    const mediaUrls = [];
    for (const mediaFile of postData.mediaFiles) {
      const buffer = await fs.readFile(mediaFile);
      const filename = path.basename(mediaFile);
      const result = await this.storageService.uploadFile(buffer, filename, { folder: "migration" });
      mediaUrls.push(result.url);
    }

    // Determine publish date
    let publishAt: Date | null = null;
    if (mappingStrategy === "drip") {
      // Schedule for future (e.g., 1 day apart)
      publishAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    }

    // Create post
    const post = await this.prisma.post.create({
      data: {
        creatorId,
        title: postData.title,
        body: postData.body,
        visibility: "SUBSCRIBERS",
        status: mappingStrategy === "publish" ? "PUBLISHED" : "SCHEDULED",
        publishAt,
      },
    });

    // Create post media
    for (const url of mediaUrls) {
      const isVideo = url.match(/\.(mp4|webm|mov)$/i);
      await this.prisma.postMedia.create({
        data: {
          postId: post.id,
          fileUrl: url,
          mediaType: isVideo ? "VIDEO" : "IMAGE",
        },
      });
    }

    return post;
  }
}

