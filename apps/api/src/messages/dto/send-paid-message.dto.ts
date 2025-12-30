import { IsString, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class SendPaidMessageDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  price: number;
}


