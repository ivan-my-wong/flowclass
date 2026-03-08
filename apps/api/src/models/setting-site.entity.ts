import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Site } from './site.entity'

@Entity('setting_site')
export class SettingSite extends BaseEntity {
  @Index('IX_setting_site_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'language' })
  language: string

  @Column({ name: 'time_zone' })
  timeZone: string

  @Column({ name: 'zone_offset', nullable: true, default: 0 })
  zoneOffset: number

  @Column({ name: 'currency' })
  currency: string

  @Column({ name: 'country' })
  country: string

  @Column({ name: 'country_code' })
  countryCode: string

  @OneToOne(() => Site, (site) => site.siteSettings, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site
}
