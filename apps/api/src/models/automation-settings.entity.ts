import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

export enum AutomationSettingsType {
  INVOICE_REMINDER = 'invoice_reminder',
  LESSON_REMINDER = 'lesson_reminder',
  INVOICE_CAMPAIGN_DUPLICATION = 'invoice_campaign_duplication',
}

@Entity('automation_settings')
export class AutomationSettings extends BaseEntity {
  @Column({ name: 'institution_id', type: 'int4' })
  institutionId: number

  @ManyToOne(() => Institution, (institution) => institution.automationSettings)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @Column({
    name: 'type',
    type: 'varchar',
    length: 255,
    default: AutomationSettingsType.INVOICE_REMINDER,
  })
  type: AutomationSettingsType

  @Column({ name: 'settings', type: 'jsonb', default: {} })
  settings: {
    enableInvoiceGeneration?: boolean
    sendWhatsappAfterGenerateInvoice?: boolean
    enableLessonReminder?: boolean
    enableInvoiceCampaignDuplication?: boolean
    invoiceCampaignTemplateId?: number
    invoiceCampaignDuplicationDay?: number
  }
}
