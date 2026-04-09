import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Course } from '@/models/courses.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassRegularPeriodsV2 } from './class-regular-periods.entity'
import { ClassEntity } from './classes.entity'
import { RecurringSchedules } from './course-recurring-schedules.entity'
import { LocationRoom } from './location-room.entity'
import { PeriodLessons } from './period-lessons.entity'
import { StudentLesson } from './student-lesson.entity'
import { User } from './user.entity'

@Entity('class_lessons')
export class ClassLesson extends BaseEntity {
  @Index('IX_class_lesson_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_class_lesson_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @ManyToOne(() => Course, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  // @Column({ name: 'enroll_course_id', nullable: true })
  // enrollCourseId: number;

  @Column({ name: 'lesson_meeting_name', nullable: true })
  lessonMeetingName: string

  @Column({ name: 'lesson_meeting_url', nullable: true })
  lessonMeetingUrl: string

  @Index('IX_class_lessons_location_id')
  @Column({ name: 'location_id', nullable: true })
  locationId: number

  @Index('IX_class_lessons_instructor_id')
  @Column({ name: 'instructor_id', nullable: true })
  instructorId: number

  @ManyToOne(() => User, (user) => user.classLessons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor?: User

  @ManyToOne(() => LocationRoom, (location) => location.classLessons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  locationRoom?: LocationRoom

  @Index('IX_class_lesson_class_id')
  @Column({ name: 'class_id' })
  classId: number

  @ManyToOne(() => ClassEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity

  // @Column({ name: 'date', type: 'date' })
  // date: Date;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date

  // @Column({ name: 'change_date', type: 'date', nullable: true })
  // changeDate: Date;

  @Column({ name: 'change_start_time', type: 'timestamptz', nullable: true })
  changeStartTime: Date

  @Column({ name: 'change_end_time', type: 'timestamptz', nullable: true })
  changeEndTime: Date

  @Column({ name: 'period_id', default: null, nullable: true })
  periodId: number

  @Column({ name: 'regular_schedule_id', default: null, nullable: true })
  regularScheduleId: number

  @Column({ name: 'lesson_id', default: null, nullable: true })
  lessonId: number

  @ManyToOne(() => ClassRegularPeriodsV2, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'regular_schedule_id' })
  regularScheduleV2: ClassRegularPeriodsV2

  @ManyToOne(() => PeriodLessons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: PeriodLessons

  @Column({ name: 'recurring_schedule_id', default: null, nullable: true })
  recurringScheduleId: number

  @ManyToOne(() => RecurringSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'lesson_id' })
  recurringSchedule: RecurringSchedules

  @Column({ name: 'is_make_up', type: 'boolean', default: false })
  isMakeUp: boolean

  @Column({ name: 'is_sub', type: 'boolean', default: false })
  isSub: boolean

  @ManyToOne(() => ClassEntity, (classEn) => classEn.classLessons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @OneToMany(() => StudentLesson, (studentLesson) => studentLesson.classLesson)
  studentLessons?: StudentLesson[]
  className?: string
  courseName?: string
  start?: Date
  end?: Date

  @AfterLoad()
  setDynamicProperties() {
    this.className = this.classEntity?.name
    this.courseName = this.course?.name
    this.start = this.changeStartTime ?? this.startTime
    this.end = this.changeEndTime ?? this.endTime
  }
}
