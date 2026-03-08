import { IsOptional } from 'class-validator'
import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

export class SeoContent {
  @IsOptional()
  metaTitle: string

  @IsOptional()
  metaDescription: string

  static example = {
    metaTitle: 'title',
    metaDescription: 'meta description',
  }
}

@Entity('seo_settings')
export class SeoSetting extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'course_id', nullable: true })
  courseId?: number

  @Column({ name: 'meta_pixel_id', nullable: true })
  metaPixelId: string

  @Column({ name: 'google_ads_conversion_id', nullable: true })
  googleAdsConversionId: string

  @Column('jsonb', { name: 'seo_content', nullable: true })
  seoContent?: SeoContent
}
