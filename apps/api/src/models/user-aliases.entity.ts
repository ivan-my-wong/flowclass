import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import { User } from '@/models/user.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { DocumentCampaignRecipients } from './document-campaign-recipients.entity'
import { EnrollCourse } from './enroll-courses.entity'
import { Institution } from './institutions.entity'
import { Invoice } from './invoice.entity'
import { StudentForm } from './student-form.entity'

@Entity('user_aliases')
// To be added later for consistency
// @Unique('UQ_user_institution', ['userId', 'institutionId'])
export class UserAlias extends BaseEntity {
  // This is the main user for this alias
  @Index('IX_user_aliases_user_id')
  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'institution_id', nullable: true })
  institutionId: number

  // This is to track the user who is registering this alias
  @Column({ name: 'ref_user_id', nullable: true })
  refUserId: number

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'email', nullable: true })
  email: string | null
  // It can be use later to track the primary user alias or profile
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean

  @Column({ name: 'is_student_parent', nullable: true, default: false })
  isStudentParent?: boolean

  @Column({ name: 'child_of_user_alias_id', nullable: true })
  childOfUserAliasId?: number

  @ManyToOne(() => UserAlias)
  @JoinColumn({ name: 'child_of_user_alias_id' })
  parentUserAlias: UserAlias

  @Column({ name: 'alias_password', nullable: true, select: false })
  aliasPassword?: string

  @Column({ name: 'remarks', nullable: true, type: 'text' })
  remarks?: string | null

  @Column({ name: 'secondary_email', nullable: true })
  secondaryEmail?: string | null

  @ManyToOne(() => User, (user) => user.aliases)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Institution, (institution) => institution.userAliases)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @ManyToOne(() => User, (user) => user.aliases)
  @JoinColumn({ name: 'ref_user_id' })
  refUser: User

  @Column({ name: 'memo', default: '', nullable: true })
  memo: string

  @Column({ name: 'assignable_lesson_count', default: 0, nullable: true })
  assignableLessonCount: number

  @Column({ name: 'overdue_reminder', type: 'jsonb', nullable: true, default: {} })
  overdueReminder?: StudentNotificationSettings

  @Column({ name: 'lesson_reminder', type: 'jsonb', nullable: true, default: {} })
  lessonReminder?: StudentNotificationSettings

  @Column({ name: 'payment_reminder', type: 'jsonb', nullable: true, default: {} })
  paymentReminder?: StudentNotificationSettings

  @OneToMany(() => StudentForm, (studentForm) => studentForm.userAlias)
  studentForms: StudentForm[]

  @OneToMany(() => EnrollCourse, (enrollCourse) => enrollCourse.userAlias)
  enrollCourses: EnrollCourse[]

  @OneToMany(() => Invoice, (invoice) => invoice.userAlias)
  invoices: Invoice[]

  @OneToMany(() => DocumentCampaignRecipients, (recipient) => recipient.student)
  documentCampaignsRecipients: DocumentCampaignRecipients[]
}
