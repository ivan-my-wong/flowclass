import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { StudentLesson } from './student-lesson.entity'

@Entity('lesson_question')
export class LessonQuestion extends BaseEntity {
  @Index('IX_lesson_question_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_lesson_question_student_lesson_id')
  @Column({ name: 'student_lesson_id', default: 0 })
  studentLessonId: number

  @Column('text', { name: 'question', nullable: true })
  question: string

  @Column({ name: 'answer', nullable: true })
  answer: string

  @Column({ name: 'parent_id', nullable: true })
  parentId: number

  @ManyToOne(() => StudentLesson, (studentLesson) => studentLesson.lessonQuestions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_lesson_id' })
  studentLesson: StudentLesson

  @ManyToOne(() => LessonQuestion, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: LessonQuestion
}
