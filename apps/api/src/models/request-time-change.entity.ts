import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { RequestTimeChangeStatus } from './enums/status'
import { StudentLesson } from './student-lesson.entity'
import { User } from './user.entity'

@Entity('request_time_change')
export class RequestTimeChange extends BaseEntity {
  @Index('IX_request_time_change_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_request_time_change_student_lesson_id')
  @Column({ name: 'student_lesson_id', default: 0 })
  studentLessonId: number

  @Index('IX_request_time_change_user_id')
  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'request_start_time', type: 'timestamptz', nullable: false })
  requestStartTime: Date

  @Column({ name: 'request_end_time', type: 'timestamptz', nullable: false })
  requestEndTime: Date

  @Column({ name: 'reason', nullable: true })
  reason?: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: RequestTimeChangeStatus,
    default: RequestTimeChangeStatus.PENDING,
  })
  status?: RequestTimeChangeStatus

  @ManyToOne(() => StudentLesson, (studentLesson) => studentLesson.lessonQuestions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_lesson_id' })
  studentLesson: StudentLesson

  @ManyToOne(() => User, (user) => user.requestTimeChanges, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User
}
