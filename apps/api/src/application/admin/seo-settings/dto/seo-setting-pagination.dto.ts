import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { SeoSettingDetailDto } from './seo-setting-detail.dto'

export class SeoSettingPageDto extends PageDto<SeoSettingDetailDto> {}

export class SeoSettingPageOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  siteId: number

  @ApiPropertyOptional()
  @IsOptional()
  institutionId: number
}
