import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { DocumentCampaign } from './document-campaign.entity'
import { Invoice } from './invoice.entity'
import { UserAlias } from './user-aliases.entity'

export enum DocumentRecipientsChannel {
  WhatsApp = 'whatsapp',
  Email = 'email',
}

export enum DocumentCampaignRecipientsStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@Entity('document_campaign_recipients')
export class DocumentCampaignRecipients extends BaseEntity {
  @Index('IX_document_campaign_recipients_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @Index('IX_document_campaign_recipients_invoice_id')
  @Column({
    name: 'invoice_id',
    type: 'int4',
    nullable: true,
  })
  invoiceId?: number
  @ManyToOne(() => Invoice, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice

  @Column({
    name: 'campaign_id',
    type: 'int4',
  })
  campaignId: number

  @Column({
    name: 'status',
    type: 'enum',
    enum: DocumentCampaignRecipientsStatus,
    default: DocumentCampaignRecipientsStatus.PENDING,
  })
  status: DocumentCampaignRecipientsStatus

  @Column({
    name: 'channel',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  channel?: DocumentRecipientsChannel

  @Column({
    name: 'student_id',
    type: 'int4',
  })
  studentId: number

  @Column({
    name: 'document_url',
    type: 'text',
    nullable: true,
  })
  documentUrl?: string

  @ManyToOne(() => DocumentCampaign, (campaign) => campaign.recipientList)
  @JoinColumn({ name: 'campaign_id' })
  campaign: DocumentCampaign

  @ManyToOne(() => UserAlias, (user) => user.documentCampaignsRecipients)
  @JoinColumn({ name: 'student_id' })
  student: UserAlias

  @Column({ name: 'is_send_to_parent', type: 'bool', default: false })
  isSendToParent?: boolean
}
