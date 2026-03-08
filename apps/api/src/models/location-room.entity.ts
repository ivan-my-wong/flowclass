import { Column, Entity, Index, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { ClassEntity } from './classes.entity'
interface Coordinate {
  lat: number
  lng: number
}

@Entity('location_room')
export class LocationRoom extends BaseEntity {
  @Index('IX_location_room_institution_id')
  @Column({ type: 'int' })
  institutionId: number

  @Index('IX_location_room_site_id')
  @Column({ type: 'int' })
  siteId: number

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'int' })
  capacity: number

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'json', nullable: true, default: '[]' })
  locationGroups: string[]

  @Column({ type: 'json', nullable: true, default: '[]' })
  equipment: string[]

  @Column({ type: 'json', nullable: true })
  coordinate: Coordinate | null

  @Column({ type: 'text', nullable: true })
  address: string

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.locationRoom)
  classes: ClassEntity[]

  @OneToMany(() => ClassLesson, (lesson) => lesson.locationRoom)
  classLessons: ClassLesson[]
}

export type QuotaTimeSlots = {
  studentIds: number[]
  quota: number
  quotaUsage: number
}

export type LocationRoomWithQuotaTimeSlot = {
  timeSlotQuota: Record<string, QuotaTimeSlots>
}
