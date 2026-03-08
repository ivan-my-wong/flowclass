import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassLesson } from './class-lessons.entity'
import { MediaMaterials } from './class-media-materials.entity'
import { ClassEntity } from './classes.entity'
import { Course } from './courses.entity'
import { Institution } from './institutions.entity'
import { UserAlias } from './user-aliases.entity'

@Entity('class_materials')
@Index(['classLessonId', 'classId', 'courseId', 'institutionId'])
export class ClassMaterials extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    nullable: false,
  })
  name: string

  @Column({
    type: 'int4',
    name: 'class_lesson_id',
    nullable: false,
  })
  classLessonId: number

  @Column({
    type: 'int4',
    name: 'class_id',
    nullable: false,
  })
  classId: number

  @Column({
    type: 'int4',
    name: 'course_id',
    nullable: false,
  })
  courseId: number

  @ManyToOne(() => ClassEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @ManyToOne(() => Course, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  @ManyToOne(() => ClassLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_lesson_id' })
  classLesson: ClassLesson

  @Column({
    type: 'int4',
    name: 'institution_id',
    nullable: false,
  })
  institutionId: number

  @ManyToOne(() => Institution, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @OneToMany(() => MediaMaterials, (mediaMaterials) => mediaMaterials.classMaterial)
  mediaMaterials: MediaMaterials[]

  @Column({
    type: 'jsonb',
    name: 'student_expiry_dates',
    nullable: true,
    default: [],
  })
  studentExpiryDates?: {
    studentId: number
    expiryDate: string
  }[] // <== [{ studentId: 900, expiryDate: '2025-12-31T23:59:59.000Z' }]

  students?: UserAlias[]
}
