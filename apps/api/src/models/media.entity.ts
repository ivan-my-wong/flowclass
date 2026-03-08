import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('medias')
export class Media extends BaseEntity {
  @Index('IX_medias_site_id')
  @Column({ name: 'site_id', default: 0 })
  siteId: number

  @Index('IX_medias_institution_id')
  @Column({ name: 'institution_id', default: 0 })
  institutionId: number

  @Column('character', { name: 'file_name', length: 255 })
  fileName: string

  @Column('character', { name: 'original_name', length: 255 })
  originalName: string

  @Column('character', { name: 'mime_type', length: 255 })
  mimeType: string

  @Column('int', { name: 'size', default: 0 })
  size: number

  @Column('character', { name: 'type', length: 255, nullable: true })
  type: string

  @Column('character', { name: 'url', length: 255 })
  url: string

  @ManyToOne(() => Institution, (institution) => institution.medias, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution
}
