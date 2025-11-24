import { IsString, IsOptional, IsDateString } from "class-validator";

export class BanUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

