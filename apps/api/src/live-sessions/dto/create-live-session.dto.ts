import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, Min } from "class-validator";
import { Type } from "class-transformer";
import { LiveAccessType } from "@prisma/client";

export class CreateLiveSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LiveAccessType)
  accessType?: LiveAccessType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  ticketPrice?: number;

  @IsOptional()
  @IsDateString()
  scheduledStartAt?: string;
}

