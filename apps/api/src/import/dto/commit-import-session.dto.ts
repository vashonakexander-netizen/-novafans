import { IsOptional, IsNumber, IsEnum, IsString, IsDateString, Min } from "class-validator";
import { Type } from "class-transformer";
import { PostVisibility } from "@prisma/client";

export class CommitImportSessionDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  groupSize?: number;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  titleTemplate?: string;

  @IsOptional()
  @IsEnum(["NOW", "DRIP"])
  scheduleMode?: "NOW" | "DRIP";

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  intervalHours?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  jitterMinutes?: number;
}

