import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { SettingSite } from '@/models/setting-site.entity'

import { InstitutionDetailDto } from './institution-detail.dto'

export class InstitutionPageDtoContent extends InstitutionDetailDto {
  @Expose()
  @Type(() => SettingSite)
  siteSetting: SettingSite
}

export class InstitutionPageDto extends PageDto<InstitutionPageDtoContent> {}

export class InstitutionPageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsNotEmpty()
  siteId: number
}
