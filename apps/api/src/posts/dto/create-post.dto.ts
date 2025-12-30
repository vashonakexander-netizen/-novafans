import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { PostVisibility, MediaType } from "@prisma/client";

class PostMediaDto {
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  media?: PostMediaDto[];

  @IsOptional()
  @IsDateString()
  publishAt?: string;
}


