import { IsOptional, IsString, IsNumber, IsBoolean, IsObject, IsEnum, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class AiPersonaSettingsDto {
  @IsOptional()
  @IsEnum(["FLIRTY", "CUTE", "DOMINANT", "SOFT"])
  tone?: "FLIRTY" | "CUTE" | "DOMINANT" | "SOFT";

  @IsOptional()
  @IsEnum(["LOW", "MEDIUM", "HIGH"])
  upsellMode?: "LOW" | "MEDIUM" | "HIGH";

  @IsOptional()
  @IsObject()
  boundaries?: {
    allowExplicitLanguage?: boolean;
    allowKinkTalk?: boolean;
    noMeetups?: boolean;
    noOffPlatformLinks?: boolean;
  };

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(300)
  replyDelaySeconds?: number;
}

export class UpdateCreatorProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  headerImageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  baseSubPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  aiPersonaEnabled?: boolean;

  @IsOptional()
  @IsObject()
  aiPersonaSettings?: AiPersonaSettingsDto;
}

