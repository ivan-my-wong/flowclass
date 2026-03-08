import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('institution_galleries')
export class InstitutionGallery extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_institution_galleries_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'image_url' })
  imageUrl: string

  @Column({ name: 'caption' })
  caption: string

  @Index('IX_institution_galleries_tags')
  @Column({ name: 'tags', nullable: true })
  tags: string

  @ManyToOne(() => Institution, (institution) => institution.galleries, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution
}
