import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { PostVisibility } from "@prisma/client";

export class UpdatePostDto {
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
  @IsDateString()
  publishAt?: string;
}


