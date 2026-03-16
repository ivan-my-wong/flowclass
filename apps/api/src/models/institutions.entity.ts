import { IsString } from 'class-validator'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'

import { InstitutionDetailDto } from '@/application/admin/institutions/dto/institution-detail.dto'
import { PhoneContactMethod, StudentPrimaryIdentifier } from '@/models/enums'
import { Invoice } from '@/models/invoice.entity'
import { NotificationRecord } from '@/models/notification-record.entity'
import { BaseEntity } from '@/modules/base/base.entity'
import { MediaDetailDto } from '@/modules/media/dto/media.dto'

import { Appointment } from './appointment.entity'
import { ClassEntity } from './classes.entity'
import { CommentEntity } from './comments.entity'
import { Coupon } from './coupons.entity'
import { Course, LongDescription } from './courses.entity'
import { InstitutionGallery } from './institution-gallery.entity'
import { Media } from './media.entity'
import { RescheduleSettings } from './reschedule-settings.entity'
import { SettingNotifications } from './setting-notifications.entity'
import { SettingSite } from './setting-site.entity'
import { Site } from './site.entity'
import { StripeConnect } from './stripe-connect.entity'
import { UserAlias } from './user-aliases.entity'
import { UserRole } from './user-role.entity'

export class addressDetail {
  @IsString()
  country: string

  @IsString()
  state: string

  @IsString()
  city: string

  @IsString()
  area: string

  @IsString()
  addressLine1: string

  @IsString()
  addressLine2: string

  static example = {
    country: 'Viet Nam',
    state: 'Ha Noi',
    city: 'Hanoi',
    area: 'My Dinh',
    addressLine1: 'Khu do thi My Dinh',
    addressLine2: '8B12',
  }
}

export type InstitutionWithSettingsDTO = Omit<InstitutionDetailDto, 'medias' | 'siteSetting'> & {
  siteSetting: SettingSite
  medias: MediaDetailDto[]
  studentMemo: UserAlias[]
}

@Entity('institutions')
export class Institution extends BaseEntity {
  @Index('IX_institutions_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'name' })
  name: string

  @Column('jsonb', { name: 'description', nullable: true })
  description?: LongDescription[]

  @Column('jsonb', { name: 'address', nullable: true })
  address: addressDetail

  @Column({ name: 'phone', nullable: true })
  phone: string

  @Column({
    name: 'phone_contact_method',
    enum: PhoneContactMethod,
    type: 'varchar',
    nullable: true,
  })
  phoneContactMethod?: PhoneContactMethod

  @Column({ name: 'contact_id', nullable: true })
  contactId: string

  @Column({ name: 'banner_image', nullable: true })
  bannerImage: string

  @Column({ name: 'website', nullable: true })
  website: string

  @Column({ name: 'url', nullable: true })
  url: string

  @Column({ nullable: true })
  logo: string

  @Column({ name: 'email', nullable: true })
  email: string

  @Column({ name: 'contact_person', nullable: true })
  contactPerson: number

  // @Column({ nullable: true })
  // subscription: string

  @Column({ nullable: true })
  gallery: string

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string

  @Column({
    name: 'course_order',
    type: 'integer',
    array: true,
    nullable: true,
  })
  courseOrder: number[]

  @OneToMany(() => Course, (course) => course.institution)
  courses: Promise<Course[]>

  @ManyToOne(() => Site, (site) => site.institutions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @OneToMany(() => Coupon, (coupon) => coupon.institution)
  coupons: Promise<Coupon[]>

  // @OneToMany(() => WKSession, (session) => session.institution)
  // sessions: Promise<WKSession[]>;

  @OneToMany(() => Appointment, (appointment) => appointment.institution)
  appointments: Promise<Appointment[]>

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.institution)
  classes: Promise<ClassEntity[]>

  @OneToMany(() => CommentEntity, (comment) => comment.institution)
  comments: Promise<CommentEntity[]>

  @OneToMany(() => Media, (media) => media.institution)
  medias: Promise<Media[]>

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
  userRoles: Promise<UserRole[]>

  @OneToMany(() => InstitutionGallery, (gallery) => gallery.institution)
  galleries: InstitutionGallery[]

  @OneToOne(() => SettingNotifications, (setting) => setting.institution, {
    createForeignKeyConstraints: false,
  })
  settingNotifications: SettingNotifications

  @OneToMany(() => NotificationRecord, (notificationRecord) => notificationRecord.institution)
  notificationRecord: NotificationRecord[]

  @OneToMany(() => Invoice, (invoice) => invoice.institution)
  invoices: Invoice[]

  @OneToMany(() => UserAlias, (userAlias) => userAlias.institution)
  userAliases: UserAlias[]

  @OneToOne(() => StripeConnect, (sc) => sc.institution)
  stripeConnect: StripeConnect

  // @deprecated TODO: Remove this
  @Column({ name: 'ai_credits', nullable: true })
  aiCredit: number

  // @deprecated TODO: Remove this
  @Column({ name: 'ai_credit_max', nullable: true })
  aiCreditMax: number

  // @deprecated TODO: Remove this
  @Column({ name: 'plan_id', nullable: true })
  planId: number

  // @deprecated TODO: Remove this
  @Column({ name: 'plan_expiry_date', nullable: true })
  planExpiryDate: Date

  @Column({
    name: 'student_primary_identifier',
    type: 'enum',
    enum: StudentPrimaryIdentifier,
    default: StudentPrimaryIdentifier.PHONE,
  })
  studentPrimaryIdentifier: StudentPrimaryIdentifier // Institution can choose primary identification method

  @OneToOne(() => RescheduleSettings, (setting) => setting.institution, {
    createForeignKeyConstraints: false,
  })
  rescheduleSettings: RescheduleSettings
}
