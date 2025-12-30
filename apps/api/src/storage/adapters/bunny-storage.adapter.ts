import { Injectable, Logger } from "@nestjs/common";
import { IStorageAdapter } from "../storage-adapter.interface";
import { randomBytes } from "crypto";
import axios from "axios";

@Injectable()
export class BunnyStorageAdapter implements IStorageAdapter {
  private readonly logger = new Logger(BunnyStorageAdapter.name);
  private storageZone: string;
  private accessKey: string;
  private cdnUrl: string;
  private apiUrl: string;

  constructor(storageZone: string, accessKey: string, cdnUrl?: string) {
    this.storageZone = storageZone;
    this.accessKey = accessKey;
    this.cdnUrl = cdnUrl || `https://${storageZone}.bunnycdn.com`;
    this.apiUrl = `https://storage.bunnycdn.com/${storageZone}`;

    this.logger.log(`BunnyCDN Storage initialized: zone=${storageZone}`);
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

    try {
      const response = await axios.put(`${this.apiUrl}/${key}`, buffer, {
        headers: {
          AccessKey: this.accessKey,
          "Content-Type": this.getContentType(originalFilename),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`BunnyCDN upload failed: ${response.statusText}`);
      }

      const url = `${this.cdnUrl}/${key}`;
      return { url, key };
    } catch (error: any) {
      this.logger.error(`BunnyCDN upload failed: ${error.message}`);
      throw new Error(`Failed to upload file to BunnyCDN: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    if (key.startsWith("http")) {
      return key;
    }
    return `${this.cdnUrl}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${key}`, {
        headers: {
          AccessKey: this.accessKey,
        },
      });
    } catch (error: any) {
      this.logger.error(`BunnyCDN delete failed: ${error.message}`);
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


