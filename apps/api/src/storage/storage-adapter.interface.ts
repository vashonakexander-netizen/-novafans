export interface IStorageAdapter {
  uploadFile(
    buffer: Buffer,
    originalFilename: string,
    options?: { folder?: string }
  ): Promise<{ url: string; key: string }>;
  
  getPublicUrl(key: string): string;
  
  deleteFile(key: string): Promise<void>;
}


