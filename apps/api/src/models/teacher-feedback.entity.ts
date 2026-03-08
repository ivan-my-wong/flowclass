import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { MediaMaterials } from './class-media-materials.entity'
import { Institution } from './institutions.entity'
import { StudentLesson } from './student-lesson.entity'
import { User } from './user.entity'

@Entity('teacher_feedback')
@Index(['teacherId', 'studentLessonId'])
export class TeacherFeedback extends BaseEntity {
  @Column({ name: 'institution_id' })
  institutionId: number

  @ManyToOne(() => Institution, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({ name: 'teacher_id' })
  teacherId: number

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User

  @Column({ name: 'student_lesson_id' })
  studentLessonId: number

  @ManyToOne(() => StudentLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_lesson_id' })
  studentLesson: StudentLesson

  @Column({ name: 'class_lesson_id', nullable: true })
  classLessonId: number

  @ManyToOne(() => ClassLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_lesson_id' })
  classLesson: ClassLesson

  @OneToMany(() => MediaMaterials, (mediaMaterials) => mediaMaterials.teacherFeedback)
  mediaMaterials: MediaMaterials[]
}
