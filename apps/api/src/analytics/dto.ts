import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, MaxLength, Max, Min } from 'class-validator';

export class PageviewDto {
  @IsString()
  @MaxLength(200)
  @Matches(/^\/\S*$/, { message: 'path must start with / and contain no whitespace' })
  path!: string;
}

export class SummaryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days: number = 14;
}
