import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { ClassEntity } from '@/models/classes.entity'
import { RecurringSchedules } from '@/models/course-recurring-schedules.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { ClassTypeEnum } from '@/models/enums/'
import { Invoice } from '@/models/invoice.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { RegularPeriods } from './course-regular-periods.entity'
import { UserAlias } from './user-aliases.entity'

@Entity('student_schedule')
export class StudentSchedule extends BaseEntity {
  @Column({ name: 'type', enum: ClassTypeEnum, type: 'varchar' })
  type: ClassTypeEnum

  @Index('IX_student_schedule_class_id')
  @Column({ name: 'class_id', nullable: true })
  classId: number

  @Index('IX_student_schedule_enroll_course_id')
  @Column({ name: 'enroll_course_id' })
  enrollCourseId: number

  @Column({ name: 'period_id', nullable: true })
  periodId: number

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: number

  @Index('IX_student_schedule_lesson_date_id')
  @Column({ name: 'recurring_schedule_id', nullable: true })
  recurringScheduleId: number

  @OneToMany(() => StudentLesson, (studentLesson) => studentLesson.studentSchedule)
  studentLessons: StudentLesson[]

  @Column({ name: 'first_student_lesson_id', nullable: true })
  firstStudentLessonId: number

  @ManyToOne(() => StudentLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'first_student_lesson_id' })
  firstStudentLesson: StudentLesson

  @ManyToOne(() => EnrollCourse, (enrollCourse) => enrollCourse.studentSchedule, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'enroll_course_id' })
  enrollCourses: EnrollCourse

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.studentSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  class?: ClassEntity

  @ManyToOne(() => RecurringSchedules, (lessonDate) => lessonDate.studentSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'recurring_schedule_id' })
  recurringSchedule: RecurringSchedules

  @ManyToOne(() => RegularPeriods, (regularPeriods) => regularPeriods.studentSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  regularPeriod: RegularPeriods

  @ManyToOne(() => Invoice, (invoice) => invoice.studentSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice
}

export class StudentScheduleType {
  type: ClassTypeEnum

  classId?: number

  enrollCourseId?: number

  invoiceId?: number

  periodId?: number

  recurringScheduleId?: number

  recurringSchedule?: RecurringSchedules

  studentLessonsString?: LessonString[]

  firstStudentLessonString?: LessonString
}

export type StudentScheduleWithUserAlias = StudentSchedule & { userAlias: UserAlias }
