import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateCryptoSubscriptionDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}


