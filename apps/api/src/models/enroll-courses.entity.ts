import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'

import { ClassEntity } from '@/models/classes.entity'
import { ClassTypeEnum, PriceType } from '@/models/enums/'
import { EnrollConfirmStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassPriceOption } from './class-price-options.entity'
import { Course } from './courses.entity'
import { RepeatFormats } from './repeat-formats.entity'
import { User } from './user.entity'
import { UserAlias } from './user-aliases.entity'

@Entity('enroll_class_mappings')
export class EnrollClassMapping extends BaseEntity {
  @Index('IX_enroll_class_mappings_enrollCourseId')
  @Column()
  enrollCourseId: number

  @Column()
  classId: number

  @Column({ nullable: true, type: 'numeric', default: 0 })
  lessonPrice: number

  @ManyToOne(() => ClassEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity

  @ManyToOne(() => EnrollCourse, (enrollCourse) => enrollCourse.multipleClassMapping, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'enrollCourseId' })
  enrollCourse: Promise<EnrollCourse>
}

export class StudentFormResponse {
  id: string
  type: string
  value: string | number | string[]
  question: string
}

export class EnrollIntoInfo {
  type: ClassTypeEnum

  // Course, Workshop, Appointment
  courseName: string

  // Class, Session, Lesson, etc.
  secondLevelName: string

  // Period, etc.
  thirdLevelName?: string

  // Class, Session, Lesson, etc.
  lessonCount: number

  price?: number

  priceType?: PriceType
}

@Entity('enroll_courses')
export class EnrollCourse extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_enroll_courses_user_id')
  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'user_alias_id', nullable: true })
  userAliasId: number

  @Index('IX_enroll_courses_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @ManyToOne(() => Course, (course) => course.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: number

  @ManyToOne(() => Invoice, (invoice) => invoice.enrollCourses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice

  @Column({ name: 'confirm_state', enum: EnrollConfirmStatus, type: 'varchar' })
  confirmState: EnrollConfirmStatus

  @Column()
  name: string

  @Column({ nullable: true })
  email?: string

  @Column()
  phone: string

  @Column('jsonb', { name: 'enroll_into', nullable: true })
  enrollInto?: EnrollIntoInfo[]

  @Column({
    name: 'billing_format_id',
    nullable: true,
    type: 'number',
  })
  billingFormatId?: number

  @Column({ name: 'billing_start_date', type: 'timestamptz', nullable: true })
  billingStartDate: Date

  @Column({ name: 'billing_end_date', type: 'timestamptz', nullable: true })
  billingEndDate: Date

  @Column({ name: 'billing_next_date', type: 'timestamptz', nullable: true })
  billingNextDate: Date

  // [TO BE DELETED] After Migration
  // @Column('jsonb', { name: 'school_name', nullable: true })
  // schoolName?: any;

  @Column('jsonb', { name: 'registration_form', nullable: true })
  registrationForm?: StudentFormResponse[]

  @Column({ name: 'price_option_id', nullable: true })
  priceOptionId: number

  @ManyToOne(() => ClassPriceOption, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'price_option_id' })
  priceOption: ClassPriceOption

  // This is the amount charged every time the system checks that it is time to pay
  @Column({ name: 'currency', nullable: true })
  currency: string

  // This is the amount charged every time the system checks that it is time to pay
  @Column({ name: 'payment_amount', type: 'numeric', nullable: true })
  paymentAmount: number

  @Column({ name: 'is_paused', default: false })
  isPaused: boolean

  @OneToMany(() => EnrollClassMapping, (mapping) => mapping.enrollCourse)
  multipleClassMapping: EnrollClassMapping[]

  @ManyToOne(() => User, (user) => user.enrollCourses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  student: User

  @ManyToOne(() => UserAlias, (userAlias) => userAlias.enrollCourses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_alias_id' })
  userAlias: UserAlias

  @OneToMany(() => StudentSchedule, (studentSchedule) => studentSchedule.enrollCourses)
  studentSchedule: StudentSchedule[]

  // @Index('IX_enroll_courses_repeat_format_id')
  // @Column({ name: 'repeat_format_id', nullable: true })
  // repeatFormatId: number;

  @OneToOne(() => RepeatFormats, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'billing_format_id' })
  repeatFormat: RepeatFormats

  // Computed properties
  preferredEmail: string
  preferredName: string
  preferredPhone: string

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  getPreferredContactInfo(): void {
    this.preferredEmail = this.email?.trim() || this.userAlias?.email || this.userAlias?.user?.email
    this.preferredName = this.name ?? this.userAlias?.name ?? this.userAlias?.user?.firstName
    this.preferredPhone = this.phone ?? this.userAlias?.user?.phone
  }
}
