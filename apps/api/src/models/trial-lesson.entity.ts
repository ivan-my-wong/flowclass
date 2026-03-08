import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { ClassEntity } from '@/models/classes.entity'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('trial_lesson')
export class TrialLesson extends BaseEntity {
  @Index('IX_trial_lessons_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_trial_lessons_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'course_ids', type: 'int', array: true, default: [] })
  courseIds: number[]

  @Column({
    name: 'use_original_price',
    type: 'boolean',
    default: false,
  })
  useOriginalPrice: boolean

  @Column({
    name: 'price',
    type: 'int8',
    default: 0,
  })
  price: number

  @Column({
    name: 'enabled',
    type: 'boolean',
    default: false,
  })
  enabled: boolean

  @OneToMany(() => ClassTrialLesson, (classTrial) => classTrial.trialLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'trial_lesson_id' })
  classes: ClassTrialLesson[]
}

@Entity('class_trial_lesson')
export class ClassTrialLesson {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'int8',
    generatedIdentity: 'BY DEFAULT',
  })
  id: number

  @Column({
    type: 'int8',
    name: 'price',
    default: 0,
  })
  price: number

  @Column({
    type: 'int8',
    name: 'trial_lesson_id',
  })
  trialLessonId: number

  @ManyToOne(() => TrialLesson, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'trial_lesson_id' })
  trialLesson: TrialLesson

  @Column({
    name: 'class_id',
    type: 'int8',
  })
  classId: number

  @ManyToOne(() => ClassEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity
}
