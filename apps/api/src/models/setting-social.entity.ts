import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('setting_social')
export class SettingSocial extends BaseEntity {
  @Index('IX_setting_social_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_setting_social_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'facebook_link' })
  facebookLink: string

  @Column({ name: 'youtube_link' })
  youtubeLink: string

  @Column({ name: 'instagram_link' })
  instagramLink: string

  @Column({ name: 'twitter_link' })
  twitterLink: string
}
