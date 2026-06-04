import { IsOptional, IsString, IsObject, IsNumber, IsBoolean } from "class-validator";

export class ScrapeConfigDto {
  // CSS selectors for scraping HTML
  @IsOptional()
  @IsString()
  imageSelector?: string; // e.g., "img.gallery-image", "img[data-src]"

  @IsOptional()
  @IsString()
  videoSelector?: string; // e.g., "video source", "video[src]"

  @IsOptional()
  @IsNumber()
  minImageSize?: number; // Minimum width in pixels to consider

  // API-based scraping
  @IsOptional()
  @IsBoolean()
  useApi?: boolean; // Set to true if scraping from API

  @IsOptional()
  @IsString()
  apiEndpoint?: string; // API endpoint URL

  @IsOptional()
  @IsObject()
  apiHeaders?: Record<string, string>; // Headers for API request (also used for HTML scraping authentication)

  @IsOptional()
  @IsObject()
  apiParams?: Record<string, any>; // Query params for API request

  @IsOptional()
  @IsString()
  apiMediaPath?: string; // JSON path to media URL, e.g., "data.media.url" or "items[].imageUrl"
}
