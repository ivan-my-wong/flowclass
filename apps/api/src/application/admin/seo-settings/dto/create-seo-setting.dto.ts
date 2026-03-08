import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { SeoContent } from '@/models/seo-setting.entity'

export class CreateSeoSettingDTO {
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsOptional()
  metaPixelId: string

  @ApiProperty()
  @IsOptional()
  googleAdsConversionId: string

  @ApiPropertyOptional({
    example: SeoContent.example,
  })
  @IsOptional()
  seoContent: SeoContent
}
