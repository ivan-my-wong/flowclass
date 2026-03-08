import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('reschedule_settings')
export class RescheduleSettings extends BaseEntity {
  @Index('IX_reschedule_settings_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @OneToOne(() => Institution, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({ name: 'select_course', default: true })
  selectCourse: boolean

  @Column({ name: 'select_class', default: true })
  selectClass: boolean

  @Column({ name: 'minimum_hours_before_request', default: 0 })
  minimumHoursBeforeRequest: number
}
