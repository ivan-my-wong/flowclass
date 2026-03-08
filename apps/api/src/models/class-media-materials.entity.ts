import { AfterInsert, AfterLoad, AfterUpdate, Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassMaterials } from './class-materials.entity'
import { StudentSubmissions } from './student-submission.entity'
import { TeacherFeedback } from './teacher-feedback.entity'

@Entity('media_materials')
export class MediaMaterials extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'type',
  })
  type: string

  @Column({
    type: 'varchar',
    name: 'file_type',
  })
  fileType: string

  @Column({
    type: 'int4',
    name: 'class_material_id',
    nullable: true,
  })
  classMaterialId: number

  @Column({
    type: 'int4',
    name: 'student_submission_id',
    nullable: true,
    default: null,
  })
  studentSubmissionId: number

  @ManyToOne(() => StudentSubmissions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'student_submission_id' })
  studentSubmission: StudentSubmissions

  @Column({
    type: 'int4',
    name: 'teacher_feedback_id',
    nullable: true,
    default: null,
  })
  teacherFeedbackId: number

  @ManyToOne(() => TeacherFeedback, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'teacher_feedback_id' })
  teacherFeedback: TeacherFeedback

  @ManyToOne(() => ClassMaterials, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_material_id' })
  classMaterial: ClassMaterials

  @Column({
    type: 'varchar',
    name: 'drive_id',
    nullable: true,
    default: null,
  })
  driveId: string

  @Column({
    type: 'varchar',
    name: 'file_id',
    nullable: true,
    default: null,
  })
  fileId: string

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string

  @Column({ name: 'expiry_date', type: 'timestamptz', nullable: true, default: null })
  expiryDate?: Date | null

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
  })
  description?: string
  @Column({
    type: 'text',
    name: 'link',
    nullable: true,
  })
  link?: string

  @Column({
    type: 'int',
    name: 'size',
    nullable: true,
    default: 0,
  })
  size?: number

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  getUrl(): void {
    if (this.link) {
      return
    }
    if (this.fileId)
      this.link = `https://drive.google.com/file/d/${this.fileId}/view?usp=sharing&export=download`
  }
}
