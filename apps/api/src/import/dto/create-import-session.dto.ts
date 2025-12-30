import { IsEnum, IsOptional, IsString } from "class-validator";
import { ImportSourceType } from "@prisma/client";

export class CreateImportSessionDto {
  @IsEnum(ImportSourceType)
  sourceType: ImportSourceType;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}


