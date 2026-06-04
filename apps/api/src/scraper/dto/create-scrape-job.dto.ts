import { IsString, IsUrl, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ScrapeConfigDto } from "./scrape-config.dto";

export class CreateScrapeJobDto {
  @IsUrl()
  sourceUrl: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScrapeConfigDto)
  config?: ScrapeConfigDto;
}
