import { IsArray, ValidateNested, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { MediaType } from "@prisma/client";

class ImportFileDto {
  @IsString()
  tempFileUrl: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsString()
  originalFilename?: string;
}

export class AddImportFilesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportFileDto)
  files: ImportFileDto[];
}

