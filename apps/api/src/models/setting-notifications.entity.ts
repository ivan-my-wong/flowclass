import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, OneToOne, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('setting_notifications')
export class SettingNotifications extends BaseEntity {
  @Index('IX_setting_notifications_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_setting_notifications_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @OneToOne(() => Institution, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({ name: 'display_email_logo', default: false })
  displayEmailLogo: boolean

  @Column({ name: 'custom_email_sender', default: false })
  customEmailSender: boolean

  @Column({ name: 'custom_message', nullable: true })
  customMessage: string

  @Column({ name: 'send_reminders', default: false })
  sendReminders: boolean

  @Column({ name: 'send_lesson_reminders', default: false })
  sendLessonReminders: boolean

  @Column({ name: 'wts_api_token', nullable: true })
  wtsApiToken: string

  @Column({ name: 'wts_api_sid', nullable: true })
  wtsApiSid: string

  @Column({ name: 'wts_api_phone_number', nullable: true })
  wtsApiPhoneNumber: string
}

@Injectable()
export class SettingNotificationsRepository extends BaseAbstractRepository<SettingNotifications> {
  private _repository: Repository<SettingNotifications>

  constructor(
    @InjectRepository(SettingNotifications)
    repository: Repository<SettingNotifications>
  ) {
    super(repository)
    this._repository = repository
  }
}
