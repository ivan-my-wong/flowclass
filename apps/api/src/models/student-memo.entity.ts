import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'
import { UserAlias } from '@/models/user-aliases.entity'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('student_memo')
export class StudentMemo extends BaseEntity {
  @Index('IX_student_memo_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_student_memo_user_id')
  @Column({ name: 'user_id' })
  userId: number

  @Index('IX_student_memo_user_alias_id')
  @Column({ name: 'user_alias_id', nullable: true })
  userAliasId: number

  @Column({ name: 'memo', default: '', nullable: true })
  memo: string

  // @deprecated Use userAlias instead
  // @Column({ name: 'contact_email', nullable: true })
  // contactEmail: string

  // @Column({ name: 'contact_phone', nullable: true })
  // contactPhone: string

  // @Column({ name: 'contact_name', nullable: true })
  // contactName: string

  @Column({ name: 'assignable_lesson_count', default: 0, nullable: true })
  assignableLessonCount: number

  @ManyToOne(() => User, (user) => user.studentMemos, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => UserAlias, (userAlias) => userAlias.studentMemos, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_alias_id' })
  userAlias: UserAlias

  @ManyToOne(() => Institution, (institution) => institution.studentMemo, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({ name: 'overdue_reminder', type: 'jsonb', nullable: true, default: {} })
  overdueReminder?: StudentNotificationSettings

  @Column({ name: 'lesson_reminder', type: 'jsonb', nullable: true, default: {} })
  lessonReminder?: StudentNotificationSettings

  @Column({ name: 'payment_reminder', type: 'jsonb', nullable: true, default: {} })
  paymentReminder?: StudentNotificationSettings

  preferredEmail: string
  preferredName: string
  preferredPhone: string

  @AfterLoad()
  async getPreferredContactInfo(): Promise<void> {
    this.preferredName = this.userAlias?.name ?? this.user?.fullName
    this.preferredEmail = this.userAlias?.user?.email ?? this.user?.email
    this.preferredPhone = this.userAlias?.user?.phone ?? this.user?.phone
  }
}
