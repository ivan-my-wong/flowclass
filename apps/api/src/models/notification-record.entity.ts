import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'
import { BaseEntity } from '@/modules/base/base.entity'

export enum NotificationType {
  CONFIRM_PAYMENT = 'CONFIRM_PAYMENT',
  REJECT_PAYMENT = 'REJECT_PAYMENT',
  REMINDER = 'REMINDER',
  APPLICATION = 'APPLICATION',
  FORGET_PASSWORD = 'FORGET_PASSWORD',
  INVITATION = 'INVITATION',
  LESSON_POSTPONE = 'LESSON_POSTPONE',
  ASSIGN_COURSE = 'ASSIGN_COURSE',
  OTHERS = 'OTHERS',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  ENROLLED_IN_COURSE = 'ENROLLED_IN_COURSE',
  RECEIVED_COUPON = 'RECEIVED_COUPON',
  UPDATE_ON_COURSE_STATUS = 'UPDATE_ON_COURSE_STATUS',
  APPLIED_FOR_COURSE = 'APPLIED_FOR_COURSE',
  STUDENT_REGISTERED = 'STUDENT_REGISTERED',
  STUDENT_PAID = 'STUDENT_PAID',
  STUDENT_QUESTION = 'STUDENT_QUESTION',
  STUDENT_ANSWER = 'STUDENT_ANSWER',
  REQUEST_TIME_CHANGE_APPROVED = 'REQUEST_TIME_CHANGE_APPROVED',
  REQUEST_TIME_CHANGE_REJECTED = 'REQUEST_TIME_CHANGE_REJECTED',
  REQUEST_TIME_CHANGE_PENDING = 'REQUEST_TIME_CHANGE_PENDING',
  APPLICATION_EMAIL_VERIFICATION = 'APPLICATION_EMAIL_VERIFICATION',
  TEACHER_FEEDBACK = 'TEACHER_FEEDBACK',
}

export const PAYMENT_REMINDER = [
  NotificationType.CONFIRM_PAYMENT,
  NotificationType.REJECT_PAYMENT,
  NotificationType.WAITING_FOR_PAYMENT,
]

export const LESSON_REMINDER = [
  NotificationType.LESSON_POSTPONE,
  NotificationType.APPLICATION,
  NotificationType.ENROLLED_IN_COURSE,
  NotificationType.RECEIVED_COUPON,
  NotificationType.UPDATE_ON_COURSE_STATUS,
  NotificationType.APPLIED_FOR_COURSE,
]

export const OVERDUE_REMINDER = [NotificationType.REMINDER]

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  LINE = 'LINE',
}

export enum NotificationStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

export type AssociatedClassType = {
  id: number
  name: string
  courseId?: number
}

@Entity('notification_record')
export class NotificationRecord extends BaseEntity {
  @Column({
    name: 'channel',
    enum: NotificationChannel,
    default: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel

  @Column({ name: 'recipient_user_id' })
  recipientUserId: number

  @Column({ name: 'institution_id', nullable: true })
  institutionId: number

  @Column({ name: 'site_id', nullable: true })
  siteId: number

  @Column({ name: 'recipient_user_email', nullable: true })
  recipientUserEmail: string

  @Column({ name: 'recipient_user_phone', nullable: true })
  recipientUserPhone: string

  @Column({ name: 'message_id', nullable: true })
  messageId: string

  @Column({ name: 'subject', nullable: true })
  subject: string

  @Column({ name: 'message', nullable: true })
  message: string

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: [...Object.values(NotificationType), ...Object.values(SupportedType)],
    default: NotificationType.OTHERS,
  })
  notificationType: NotificationType | SupportedType

  @Column({
    name: 'notification_status',
    type: 'enum',
    enum: [...Object.values(NotificationStatus), ...Object.values(SupportedType)],
    nullable: true,
  })
  notificationStatus: NotificationStatus | SupportedType

  @Column({
    name: 'whatsapp_template_id',
    type: 'number',
    nullable: true,
  })
  whatsappTemplateId?: number

  @Column({
    name: 'associated_class',
    type: 'jsonb',
    nullable: true,
  })
  associatedClass: AssociatedClassType[]

  @ManyToOne(() => WhatsappTemplateEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'whatsapp_template_id' })
  whatsappTemplate?: WhatsappTemplateEntity

  @ManyToOne(() => User, (user) => user.notificationRecord, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'recipient_user_id' })
  user: User

  @ManyToOne(() => Institution, (institution) => institution.notificationRecord, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @ManyToOne(() => Site, (site) => site.notificationRecord, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @Column({
    name: 'invoice_metadata',
    nullable: true,
    type: 'jsonb',
  })
  invoiceMetadata: Record<string, any>

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date
}
