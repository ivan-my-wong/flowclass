import { IsEnum, IsNotEmpty } from 'class-validator'
import { Column, Entity, Index } from 'typeorm'

import { TextVersion, WebsiteTemplate } from '@/models/enums'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('setting_webpage_institutions')
export class SettingWebpageInstitution extends BaseEntity {
  @Index('IX_setting_webpage_institutions_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_setting_webpage_institutions_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'banner_image', nullable: true })
  bannerImage: string

  @Column({ name: 'name', nullable: true })
  name: string

  @Column({ name: 'theme_color', nullable: true })
  themeColor: string

  @Column({
    name: 'templates',
    nullable: true,
    default: WebsiteTemplate.Hero,
    type: 'varchar',
    enum: WebsiteTemplate,
  })
  templates: WebsiteTemplate

  @Column({ name: 'secondary_color', nullable: true })
  secondaryColor: string

  @Column({ name: 'highlight_color', nullable: true })
  highlightColor: string

  @Column('jsonb', { name: 'social_media', nullable: true })
  socialMedia: SocialMedia[]

  @Column({ name: 'terms_condition', nullable: true })
  termsCondition: string

  @Column({ name: 'student_login', nullable: true })
  studentLogin: boolean

  @IsEnum(TextVersion)
  @Column({ name: 'text_version', type: 'varchar', enum: TextVersion, nullable: true })
  textVersion?: TextVersion
}

export class SocialMedia {
  @IsNotEmpty()
  id: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  link: string

  static example = {
    id: '220',
    name: 'instagram',
    link: 'https://www.instagram.com/katarinabluu/',
  }
}
