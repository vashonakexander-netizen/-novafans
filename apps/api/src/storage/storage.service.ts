import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { getStorageConfig } from "@savage-house/config";
import { IStorageAdapter } from "./storage-adapter.interface";
import { LocalStorageAdapter } from "./adapters/local-storage.adapter";
import { S3StorageAdapter } from "./adapters/s3-storage.adapter";
import { BunnyStorageAdapter } from "./adapters/bunny-storage.adapter";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private adapter: IStorageAdapter;
  private config: ReturnType<typeof getStorageConfig>;

  onModuleInit() {
    this.config = getStorageConfig();

    // Initialize adapter based on provider
    if (this.config.provider === "s3") {
      if (!this.config.s3Bucket || !this.config.s3Region || !this.config.s3AccessKeyId || !this.config.s3SecretAccessKey) {
        this.logger.warn("S3 config incomplete, falling back to local storage");
        this.adapter = new LocalStorageAdapter(this.config.uploadsDir, this.config.baseUrl);
      } else {
        this.logger.log("Using S3 storage adapter");
        this.adapter = new S3StorageAdapter(
          this.config.s3Bucket,
          this.config.s3Region,
          this.config.s3AccessKeyId,
          this.config.s3SecretAccessKey,
          this.config.baseUrl // Use baseUrl as CDN URL if configured
        );
      }
    } else if (this.config.provider === "bunny") {
      if (!this.config.bunnyStorageZone || !this.config.bunnyAccessKey) {
        this.logger.warn("BunnyCDN config incomplete, falling back to local storage");
        this.adapter = new LocalStorageAdapter(this.config.uploadsDir, this.config.baseUrl);
      } else {
        this.logger.log("Using BunnyCDN storage adapter");
        this.adapter = new BunnyStorageAdapter(
          this.config.bunnyStorageZone,
          this.config.bunnyAccessKey,
          this.config.bunnyCdnUrl || this.config.baseUrl
        );
      }
    } else {
      // Default to local storage
      this.logger.log("Using local storage adapter");
      this.adapter = new LocalStorageAdapter(this.config.uploadsDir, this.config.baseUrl);
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    options?: { folder?: string }
  ): Promise<{ url: string }> {
    const result = await this.adapter.uploadFile(buffer, originalFilename, options);
    return { url: result.url };
  }

  getPublicUrl(pathOrKey: string): string {
    return this.adapter.getPublicUrl(pathOrKey);
  }

  async deleteFile(pathOrKey: string): Promise<void> {
    await this.adapter.deleteFile(pathOrKey);
  }
}

