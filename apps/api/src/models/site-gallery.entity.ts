import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('site_galleries')
export class SiteGallery extends BaseEntity {
  @Index('IX_site_galleries_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_site_galleries_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'image_url' })
  imageUrl: string

  @Column({ name: 'caption' })
  caption: string

  @Column({ name: 'index', type: 'int' })
  index: number
}
