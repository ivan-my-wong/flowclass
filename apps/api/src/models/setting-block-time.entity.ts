import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('setting_block_time')
export class SettingBlockTime extends BaseEntity {
  @Index('IX_setting_block_time_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'whole_day', type: 'boolean', nullable: false })
  wholeDay: boolean

  @Column({ name: 'start_time', type: 'timestamptz', nullable: false })
  startTime: Date

  @Column({ name: 'end_time', type: 'timestamptz', nullable: false })
  endTime: Date
}
