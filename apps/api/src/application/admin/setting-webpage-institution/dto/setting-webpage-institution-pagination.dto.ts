import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { SettingWebpageInstitutionDetailDto } from './setting-webpage-institution-detail.dto'

export class SettingWebpageInstitutionPageDto extends PageDto<SettingWebpageInstitutionDetailDto> {}

export class SettingWebpageInstitutionPageOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  institutionId: number

  @ApiPropertyOptional()
  @IsOptional()
  name: string
}
