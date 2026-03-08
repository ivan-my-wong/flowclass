import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'

import { Appointment } from '@/models/appointment.entity'
import { ClassTypeEnum, PriceType } from '@/models/enums/'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { ClassPriceOption } from './class-price-options.entity'
import { ClassRegularSchedulesV2 } from './class-regular-schedules.entity'
import { RecurringSchedules } from './course-recurring-schedules.entity'
import { RegularPeriods } from './course-regular-periods.entity'
import { Course } from './courses.entity'
import { Institution } from './institutions.entity'
import { LocationRoom } from './location-room.entity'
import { RepeatFormats } from './repeat-formats.entity'
import { Site } from './site.entity'
import { StudentSchedule } from './student-schedule.entity'
import { User } from './user.entity'

export enum RepeatUnit {
  minutes = 'minutes', // TODO: Testing automation flow purpose, Disable this on production
  days = 'days',
  weeks = 'weeks',
  month = 'months',
}

export class RecurringFormat {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  every: number

  @IsNotEmpty()
  @IsEnum(RepeatUnit)
  unit: RepeatUnit // days | weeks | month

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  times: number // how many times of repeat

  static example = {
    every: 3,
    unit: RepeatUnit.days,
    times: 15,
  }
}

export class ApplicationPeriod {
  @IsOptional()
  @IsDateString()
  startDatetime?: string | null // ISO 8601

  @IsOptional()
  @IsDateString()
  endDatetime?: string | null

  isCurrentlyAvailable(): boolean {
    const now = new Date()
    const start = this.startDatetime ? new Date(this.startDatetime) : null
    const end = this.endDatetime ? new Date(this.endDatetime) : null
    if (!start && !end) return true
    if (start && !end) return now >= start
    if (!start && end) return now <= end
    return now >= start && now <= end
  }

  isValid(): boolean {
    if (!this.startDatetime || !this.endDatetime) return true
    return new Date(this.startDatetime) <= new Date(this.endDatetime)
  }

  static example = {
    startDatetime: '2024-09-04T12:00:00Z',
    endDatetime: '2024-09-14T12:00:00Z',
  }
}

@Entity('classes')
export class ClassEntity extends BaseEntity {
  @Index('IX_classes_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_classes_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_classes_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'name' })
  name: string

  @Column({ enum: ClassTypeEnum, type: 'enum' })
  type: ClassTypeEnum

  @Column({ name: 'quota', default: 0 })
  quota: number

  @Index('IX_classes_location_id')
  @Column({ name: 'location_id', nullable: true })
  locationId: number

  @ManyToOne(() => LocationRoom, (location) => location.classes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  locationRoom: LocationRoom

  @Index('IX_classes_instructor_id')
  @Column({ name: 'instructor_id', nullable: true })
  instructorId: number

  @ManyToOne(() => User, (user) => user.classes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User

  // @deprecated, to be removed after migration
  @Column({ name: 'tuition', nullable: true })
  tuition?: number

  @Column({
    name: 'price_type',
    enum: PriceType,
    default: PriceType.PER_LESSON,
    type: 'varchar',
  })
  priceType: PriceType

  @OneToMany(() => ClassPriceOption, (priceOption) => priceOption.classEntity, {
    eager: true,
  })
  priceOptions: ClassPriceOption[]

  @Column({ name: 'drop_in', default: true })
  dropIn: boolean

  @Column({ name: 'enrollment_offset', default: 0 })
  enrollmentOffset: number

  @Column({ name: 'discounted_price', nullable: true })
  discountedPrice: number

  @Column({ name: 'teaching_language', nullable: true })
  teachingLanguage: string

  @Column({ name: 'locality', nullable: true })
  locality: string

  @Column({ name: 'detail_address', nullable: true })
  detailAddress: string

  @Column({ name: 'class_description', nullable: true })
  classDescription: string

  @Column({ name: 'class_meeting_url', nullable: true })
  classMeetingUrl: string

  @Column({ name: 'class_remark', nullable: true })
  classRemark: string

  @Column({ name: 'default_price_id', nullable: true })
  defaultPriceId: string

  @Column({ name: 'set_multiple_class', default: false, nullable: true })
  setMultipleClass: boolean

  @Column({ name: 'set_multiple_applicant', default: false, nullable: true })
  setMultipleApplicant: boolean

  @Column({ name: 'auto_pay', default: true, nullable: true })
  autoPay: boolean

  @Column({ name: 'regular_schedule_id', nullable: true })
  regularScheduleId: number

  @Column('jsonb', { name: 'application_period', nullable: true })
  applicationPeriod?: ApplicationPeriod

  @OneToOne(() => ClassRegularSchedulesV2, (period) => period.classEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'regular_schedule_id' })
  regularScheduleV2: ClassRegularSchedulesV2

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: number

  @OneToOne(() => Appointment, (appointment) => appointment.class, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment

  @OneToOne(() => RepeatFormats, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'recurring_format_id' })
  recurringFormat: RepeatFormats

  @ManyToOne(() => Site, (site) => site.classes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @ManyToOne(() => Institution, (institution) => institution.classes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @ManyToOne(() => Course, (course) => course.classes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  @OneToMany(() => RegularPeriods, (lesson) => lesson.classEntity)
  regularPeriods: RegularPeriods[]

  // Deprecated, to be removed after migration, and use recurringSchedule instead
  @OneToMany(() => RecurringSchedules, (lessonDate) => lessonDate.classEntity)
  recurringSchedules: RecurringSchedules[]

  @OneToMany(() => ClassLesson, (classLesson) => classLesson.classEntity)
  classLessons: ClassLesson[]

  @OneToMany(() => StudentSchedule, (StudentSchedule) => StudentSchedule.class)
  studentSchedules: StudentSchedule[]

  @Index('IX_classes_is_archived')
  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean

  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt: Date | null

  @Column({ name: 'classes_code', nullable: true })
  classesCode: string
}
