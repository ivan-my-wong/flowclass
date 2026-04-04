import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { EnrollCourse } from '@/models/enroll-courses.entity'
import { AttendanceStatus, SharedVideoStatus } from '@/models/enums/status'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { User } from '@/models/user.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { ClassEntity } from './classes.entity'
import { Course } from './courses.entity'
import { LessonQuestion } from './lesson-question.entity'
import { StudentSubmissions } from './student-submission.entity'
import { TeacherFeedback } from './teacher-feedback.entity'

@Entity('student_lesson')
export class StudentLesson extends BaseEntity {
  @Index('IX_student_lesson_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_student_lesson_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'enroll_course_id', nullable: true })
  enrollCourseId: number

  @ManyToOne(() => EnrollCourse, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'enroll_course_id' })
  enrollCourse: EnrollCourse

  @ManyToOne(() => Course, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  @ManyToOne(() => ClassEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity

  @Column({ name: 'student_schedule_id', nullable: true })
  studentScheduleId: number

  @ManyToOne(() => StudentSchedule, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_schedule_id' })
  studentSchedule: StudentSchedule

  @Index('IX_student_lesson_class_id')
  @Column({ name: 'class_id', nullable: true })
  classId: number

  @Index('IX_student_lesson_user_id')
  @Column({ name: 'user_id', nullable: true })
  userId: number

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  // @Column({ name: 'date', type: 'date', nullable: false })
  // date: Date;

  @Column({ name: 'class_lesson_id', nullable: true })
  classLessonId: number

  @ManyToOne(() => ClassLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_lesson_id' })
  classLesson: ClassLesson

  @Column({ name: 'start_time', type: 'timestamptz', nullable: false })
  startTime: Date

  @Column({ name: 'end_time', type: 'timestamptz', nullable: false })
  endTime: Date

  @Column({ name: 'change_class_lesson_id', nullable: true })
  changeClassLessonId: number

  @ManyToOne(() => ClassLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'change_class_lesson_id' })
  changeClassLesson: ClassLesson

  @Column({ name: 'change_start_time', type: 'timestamptz', nullable: true })
  changeStartTime: Date

  @Column({ name: 'change_end_time', type: 'timestamptz', nullable: true })
  changeEndTime: Date

  // This is to be renamed to is_disabled, so if it is true, the student lesson is disabled and will not be retrieved in the class-lesson list
  @Column({ name: 'is_checkin', type: 'boolean', default: false })
  isCheckin: boolean

  @Column({ name: 'is_extra', default: false })
  isExtra: boolean

  @Column({
    name: 'attendance',
    enum: AttendanceStatus,
    default: AttendanceStatus.PENDING,
    type: 'enum',
  })
  attendance: AttendanceStatus

  @OneToMany(() => LessonQuestion, (lessonQuestion) => lessonQuestion.studentLesson, {
    cascade: true,
  })
  lessonQuestions: LessonQuestion[]

  @OneToMany(() => StudentSubmissions, (studentSubmission) => studentSubmission.studentLesson, {
    cascade: true,
  })
  studentSubmissions: StudentSubmissions[]

  @OneToMany(() => TeacherFeedback, (teacherFeedback) => teacherFeedback.studentLesson, {
    cascade: true,
  })
  teacherFeedbacks: TeacherFeedback[]

  @Column({
    name: 'expiry_date',
    type: 'timestamptz',
    nullable: false,
    default: () => "NOW() + INTERVAL '30 days'",
  })
  expiryDate: Date

  @Column({ name: 'remarks', type: 'text', nullable: true, default: null })
  remarks: string | null

  @Column({
    name: 'has_shared_video',
    type: 'varchar',
    nullable: true,
    default: SharedVideoStatus.NONE,
  })
  hasSharedVideo?: SharedVideoStatus
}
