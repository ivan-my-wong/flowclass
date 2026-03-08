import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { SettingSiteDetailDto } from './setting-site-detail.dto'

export class SettingSitePaginationDto extends PageDto<SettingSiteDetailDto> {}

export class SettingSiteOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  siteId: number

  @ApiPropertyOptional()
  @IsOptional()
  language: string
}
