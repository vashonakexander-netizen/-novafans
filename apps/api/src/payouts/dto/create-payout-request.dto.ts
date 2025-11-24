import { IsNumber, IsString, IsObject, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreatePayoutRequestDto {
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount: number;

  @IsString()
  payoutMethod: string; // "USDT", "USDC", "BTC", "BANK", "PAXUM", etc.

  @IsOptional()
  @IsObject()
  payoutDetails?: any; // Wallet address, bank info, etc.
}

