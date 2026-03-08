import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { MediaMaterials } from './class-media-materials.entity'
import { Institution } from './institutions.entity'
import { StudentLesson } from './student-lesson.entity'
import { User } from './user.entity'
import { UserAlias } from './user-aliases.entity'

@Entity('student_submissions')
@Index(['studentId', 'studentLessonId'])
export class StudentSubmissions extends BaseEntity {
  @Column({ name: 'institution_id' })
  institutionId: number

  @ManyToOne(() => Institution, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({ name: 'student_id' })
  studentId: number

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: User

  @Column({ name: 'student_lesson_id' })
  studentLessonId: number

  @ManyToOne(() => StudentLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_lesson_id' })
  studentLesson: StudentLesson

  @Column({ name: 'class_lesson_id' })
  classLessonId: number

  @ManyToOne(() => ClassLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_lesson_id' })
  classLesson: ClassLesson

  @OneToMany(() => MediaMaterials, (mediaMaterials) => mediaMaterials.studentSubmission)
  mediaMaterials: MediaMaterials[]

  // This property will be set at service level
  studentAlias: UserAlias

  // This property will be set at service level
  teacherResponses: MediaMaterials[]
}
