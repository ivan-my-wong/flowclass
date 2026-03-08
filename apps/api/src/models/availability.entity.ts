import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { Appointment } from './appointment.entity'
import { Institution } from './institutions.entity'

export type AvailableSchedules = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

export type DateOverride = {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}

@Entity('availabilities')
export class Availability extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column('jsonb', { name: 'available_schedules', default: [] })
  availableSchedules?: AvailableSchedules[]

  @Column({ name: 'integration_calendar_id', nullable: true })
  integrationCalendarId?: number

  @Column('jsonb', { name: 'date_overrides', default: [] })
  dateOverrides?: DateOverride[]

  @Column({ name: 'assigned_user_id', nullable: true })
  assignedUserId?: number

  @ManyToOne(() => Institution, (institution) => institution.appointments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @OneToMany(() => Appointment, (appointment) => appointment.availability)
  appointments: Appointment[]
}

export class AvailabilityRepository extends BaseAbstractRepository<Availability> {
  private _repository: Repository<Availability>

  constructor(
    @InjectRepository(Availability)
    repository: Repository<Availability>
  ) {
    super(repository)
    this._repository = repository
  }
}
