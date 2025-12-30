import { IsString, IsOptional, IsNumber, IsBoolean, IsUrl, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class OnboardingStep1Dto {
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  headerImageUrl?: string;
}

export class OnboardingStep2Dto {
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  @Max(1000)
  baseSubPrice: number;
}

export class OnboardingStep3Dto {
  @IsString()
  payoutMethod: string; // "USDT", "USDC", "BTC", "BANK", "PAXUM", etc.

  @IsOptional()
  payoutDetails?: any; // JSON object with wallet address, bank info, etc.
}

export class OnboardingStep4Dto {
  @IsBoolean()
  aiPersonaEnabled: boolean;

  @IsOptional()
  aiPersonaSettings?: any; // JSON object with tone, upsellMode, boundaries, etc.
}

export class OnboardingStep5Dto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
}


