import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateMessageDto {
  @IsString()
  creatorId: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

