import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import { randomBytes } from "crypto";
import { IStorageAdapter } from "../storage-adapter.interface";

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private uploadsDir: string;
  private storageBaseUrl: string;

  constructor(uploadsDir: string, storageBaseUrl: string) {
    this.uploadsDir = path.isAbsolute(uploadsDir) ? uploadsDir : path.join(process.cwd(), uploadsDir);
    this.storageBaseUrl = storageBaseUrl;
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    options?: { folder?: string }
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(originalFilename);
    const filename = `${randomBytes(16).toString("hex")}${ext}`;
    const folder = options?.folder || "";
    const folderPath = folder ? path.join(this.uploadsDir, folder) : this.uploadsDir;

    // Ensure folder exists
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);
    await fs.writeFile(filePath, buffer);

    const relativePath = `/uploads/${folder ? `${folder}/` : ""}${filename}`;
    const publicUrl = `${this.storageBaseUrl}${relativePath}`;
    const key = relativePath;

    return { url: publicUrl, key };
  }

  getPublicUrl(key: string): string {
    if (key.startsWith("http")) {
      return key;
    }
    if (key.startsWith("/")) {
      return `${this.storageBaseUrl}${key}`;
    }
    return `${this.storageBaseUrl}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, key.replace("/uploads/", ""));
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File may not exist, ignore
    }
  }
}

