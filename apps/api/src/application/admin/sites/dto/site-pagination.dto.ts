import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { SiteDetailDto } from './site-detail.dto'

export class SitePageDto extends PageDto<SiteDetailDto> {}

export class SitePageOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  url: string
}
