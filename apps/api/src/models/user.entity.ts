import { Exclude } from 'class-transformer'
import { AfterLoad, Column, Entity, Index, OneToMany } from 'typeorm'

import { Permission } from '@/application/admin/users/dto/user-role.dto'
import { Invoice } from '@/models/invoice.entity'
import { NotificationRecord } from '@/models/notification-record.entity'
import { BaseEntity } from '@/modules/base/base.entity'
import { permissionsOfUser } from '@/utils/user-roles.utils'

import { ClassLesson } from './class-lessons.entity'
import { ClassEntity } from './classes.entity'
import { DocumentCampaign } from './document-campaign.entity'
import { EnrollCourse } from './enroll-courses.entity'
import { RequestTimeChange } from './request-time-change.entity'
import { StudentLesson } from './student-lesson.entity'
import { UserAlias } from './user-aliases.entity'
import { UserRole } from './user-role.entity'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('users')
export class User extends BaseEntity {
  @Index() // Add an index to improve search performance by email
  @Column({ name: 'email', nullable: true })
  email?: string

  @Index()
  @Column({ name: 'phone', unique: true, nullable: false })
  phone: string

  @Exclude()
  @Column({ name: 'password' })
  password: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name', nullable: true })
  lastName: string

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean

  @Column({ name: 'last_active_time', type: 'timestamptz', default: null })
  lastActiveTime: Date

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string

  @Column({ name: 'company', nullable: true })
  company: string

  @Column({ name: 'position', nullable: true })
  position: string

  @Column({ name: 'social', nullable: true })
  social: string

  @Column({ name: 'country', nullable: true })
  country: string

  @Column({ name: 'visibility', default: true })
  visibility: string

  // Remove this after migration
  @Column({ name: 'status', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true, eager: true })
  userRoles: UserRole[]

  @OneToMany(() => EnrollCourse, (enrollCourse) => enrollCourse.student)
  enrollCourses: EnrollCourse[]

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[]

  @OneToMany(() => NotificationRecord, (notificationRecord) => notificationRecord.user)
  notificationRecord: NotificationRecord[]

  @AfterLoad()
  getPermissions(): void {
    if (this.userRoles) {
      this.permissions = permissionsOfUser(this.userRoles)
    }
  }
  permissions: Permission[]

  @OneToMany(() => UserAlias, (userAlias) => userAlias.user)
  aliases: UserAlias[]

  @OneToMany(() => StudentLesson, (studentLesson) => studentLesson.user)
  studentLessons: StudentLesson[]

  @OneToMany(() => RequestTimeChange, (requestTimeChange) => requestTimeChange.user)
  requestTimeChanges: RequestTimeChange[]

  fullName: string

  @AfterLoad()
  async getFullName(): Promise<void> {
    this.fullName = `${this.firstName}${this.lastName ? ' ' + this.lastName : ''}`
  }

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.instructor)
  classes: ClassEntity[]

  @OneToMany(() => ClassLesson, (classLesson) => classLesson.instructor)
  classLessons: ClassLesson[]

  @OneToMany(() => DocumentCampaign, (campaign) => campaign.user)
  documentCampaigns: DocumentCampaign[]

  activeUserAliasId?: number
}
