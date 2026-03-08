import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { Matches } from 'class-validator'

import { LongDescription } from '@/models/courses.entity'
import { PhoneContactMethod, StudentPrimaryIdentifier } from '@/models/enums/'
import { InstitutionGallery } from '@/models/institution-gallery.entity'
import { addressDetail } from '@/models/institutions.entity'
import { SocialMedia } from '@/models/setting-webpage-institutions.entity'
import { MediaDetailDto } from '@/modules/media/dto/media.dto'

import { SettingWebpageInstitutionDetailDto } from '../../setting-webpage-institution/dto/setting-webpage-institution-detail.dto'
import { SiteRegionDto } from '../../sites/dto/site-detail.dto'

@Exclude()
export class InstitutionDetailDto {
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiPropertyOptional()
  @Expose()
  name?: string

  @ApiPropertyOptional()
  @Expose()
  description?: LongDescription[]

  @ApiPropertyOptional()
  @Expose()
  address?: addressDetail

  @ApiPropertyOptional()
  @Expose()
  phone?: string

  @ApiPropertyOptional()
  @Expose()
  phoneContactMethod?: PhoneContactMethod

  @ApiPropertyOptional()
  @Expose()
  contactId?: string

  @ApiPropertyOptional()
  @Expose()
  bannerImage?: string

  @ApiPropertyOptional()
  @Expose()
  website?: string

  @ApiPropertyOptional()
  @Expose()
  @Matches(/^[\w\-_]+$/)
  url?: string

  @ApiPropertyOptional()
  @Expose()
  logo?: string

  @ApiPropertyOptional()
  @Expose()
  email?: string

  @ApiProperty()
  @ApiPropertyOptional()
  @Expose()
  contactPerson?: number

  @ApiPropertyOptional()
  @Expose()
  subscription?: string

  @Expose()
  videoUrl?: string

  @Expose()
  aiCredit?: number

  @Expose()
  aiCreditMax?: number

  @Expose()
  @Type(() => SiteRegionDto)
  site?: SiteRegionDto

  @Expose()
  @Type(() => MediaDetailDto)
  medias?: MediaDetailDto[]

  @ApiPropertyOptional()
  @Expose()
  courseOrder?: number[]

  @Expose()
  @Type(() => InstitutionGallery)
  galleries: InstitutionGallery[]

  @Expose()
  @ApiPropertyOptional()
  studentPrimaryIdentifier: StudentPrimaryIdentifier

  @Expose()
  @ApiPropertyOptional()
  createdAt?: string
}

export class PublicInstitutionDetailDto {
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiPropertyOptional()
  @Expose()
  name?: string

  @ApiPropertyOptional()
  @Expose()
  description?: string

  @ApiPropertyOptional()
  @Expose()
  address?: addressDetail

  @ApiPropertyOptional()
  @Expose()
  phone?: string

  @ApiPropertyOptional()
  @Expose()
  phoneContactMethod?: PhoneContactMethod

  @ApiPropertyOptional()
  @Expose()
  bannerImage?: string

  @ApiPropertyOptional()
  @Expose()
  website?: string

  @ApiPropertyOptional()
  @Expose()
  url?: string

  @ApiPropertyOptional()
  @Expose()
  logo?: string

  @ApiPropertyOptional()
  @Expose()
  email?: string

  @ApiProperty()
  @ApiPropertyOptional()
  @Expose()
  contactPerson?: number

  @ApiPropertyOptional()
  @Expose()
  subscription?: string

  @Expose()
  videoUrl?: string

  @Expose()
  @Type(() => SiteRegionDto)
  site?: SiteRegionDto

  @Expose()
  @Type(() => MediaDetailDto)
  medias?: MediaDetailDto[]

  @Expose()
  @Type(() => MediaDetailDto)
  institutionSettings?: SettingWebpageInstitutionDetailDto[]

  @ApiPropertyOptional()
  @Expose()
  socialMedia: SocialMedia[]
}
