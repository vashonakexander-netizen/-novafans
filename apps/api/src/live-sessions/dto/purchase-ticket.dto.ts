import { IsOptional, IsString } from "class-validator";

export class PurchaseTicketDto {
  @IsOptional()
  @IsString()
  message?: string;
}

