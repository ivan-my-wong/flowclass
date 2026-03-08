import { AfterLoad, Column, Entity, OneToMany, OneToOne } from 'typeorm'

import { Invoice } from '@/models/invoice.entity'
import { NotificationRecord } from '@/models/notification-record.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassEntity } from './classes.entity'
import { CommentEntity } from './comments.entity'
import { Course } from './courses.entity'
import { Institution } from './institutions.entity'
import { SettingSite } from './setting-site.entity'
import { UserRole } from './user-role.entity'

@Entity('sites')
export class Site extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  logo: string

  @Column()
  url: string

  @Column({ name: 'site_admin' })
  siteAdmin: number

  @Column({ nullable: true })
  subscription: string

  @Column({ nullable: true })
  banner: string

  @Column({ nullable: true })
  country: string

  @Column({ nullable: true })
  currency: string

  @Column({ nullable: true })
  language: string

  timeZone: { id?: string; offset?: number }

  @Column({ name: 'default_institution_id', nullable: true })
  defaultInstitutionId: number

  @Column({ name: 'custom_domain', nullable: true })
  customDomain: string

  @OneToOne(() => SettingSite, (settingSite) => settingSite.site, {
    createForeignKeyConstraints: false,
    lazy: true,
  })
  siteSettings: Promise<SettingSite>

  @OneToMany(() => Course, (course) => course.site, { lazy: true })
  courses: Promise<Course[]>

  @OneToMany(() => Institution, (institution) => institution.site, { lazy: true })
  institutions: Promise<Institution[]>

  // @OneToMany(() => WKSession, (session) => session.site)
  // sessions: Promise<WKSession[]>;

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.site, { lazy: true })
  classes: Promise<ClassEntity[]>

  @OneToMany(() => CommentEntity, (comment) => comment.site, { lazy: true })
  comments: Promise<CommentEntity[]>

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true, lazy: true })
  userRoles: Promise<UserRole[]>

  @OneToMany(() => Invoice, (invoices) => invoices.site, { cascade: true, lazy: true })
  invoices: Promise<Invoice[]>

  @OneToMany(() => NotificationRecord, (notificationRecord) => notificationRecord.site)
  notificationRecord: NotificationRecord[]

  @AfterLoad()
  async setConfig(): Promise<void> {
    const setting = await this.siteSettings
    this.country = setting?.country
    this.currency = setting?.currency
    this.language = setting?.language
    this.timeZone = {
      id: setting?.timeZone,
      offset: setting?.zoneOffset,
    }
  }
}
