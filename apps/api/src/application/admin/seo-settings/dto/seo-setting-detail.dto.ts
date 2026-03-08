import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { SeoContent } from '@/models/seo-setting.entity'

@Exclude()
export class SeoSettingDetailDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiPropertyOptional()
  @Expose()
  siteId: number

  @ApiPropertyOptional()
  @Expose()
  institutionId: number

  @ApiPropertyOptional()
  @Expose()
  metaPixelId: string

  @ApiPropertyOptional()
  @Expose()
  googleAdsConversionId: string

  @ApiPropertyOptional()
  @Expose()
  seoContent?: SeoContent
}
