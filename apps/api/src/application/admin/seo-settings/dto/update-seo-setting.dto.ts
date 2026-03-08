import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

import { SeoContent } from '@/models/seo-setting.entity'

export class UpdateSeoSettingDTO {
  siteId: number

  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  metaPixelId: string

  @ApiProperty()
  @IsNotEmpty()
  googleAdsConversionId: string

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  courseId: number

  @ApiPropertyOptional({
    example: SeoContent.example,
  })
  @IsOptional()
  seoContent: SeoContent
}

export class UpdateCourseSeoSettingDTO {
  @IsOptional()
  metaTitle: string

  @IsOptional()
  metaDescription: string
}
