import { Injectable, Logger } from "@nestjs/common";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { IStorageAdapter } from "../storage-adapter.interface";
import { randomBytes } from "crypto";

@Injectable()
export class S3StorageAdapter implements IStorageAdapter {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private cdnUrl?: string;

  constructor(
    bucket: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
    cdnUrl?: string
  ) {
    this.bucket = bucket;
    this.region = region;
    this.cdnUrl = cdnUrl;

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`S3 Storage initialized: bucket=${bucket}, region=${region}`);
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    options?: { folder?: string }
  ): Promise<{ url: string; key: string }> {
    const ext = originalFilename.split(".").pop() || "";
    const filename = `${randomBytes(16).toString("hex")}${ext ? `.${ext}` : ""}`;
    const folder = options?.folder || "";
    const key = folder ? `${folder}/${filename}` : filename;

    const contentType = this.getContentType(originalFilename);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: "public-read",
        })
      );

      const url = this.cdnUrl
        ? `${this.cdnUrl}/${key}`
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error: any) {
      this.logger.error(`S3 upload failed: ${error.message}`);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    if (key.startsWith("http")) {
      return key;
    }
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (error: any) {
      this.logger.error(`S3 delete failed: ${error.message}`);
      // Don't throw, just log
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

