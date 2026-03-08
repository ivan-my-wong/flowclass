import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { InvoiceItem } from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import { BaseEntity } from '@/modules/base/base.entity'

import { DocumentCampaignRecipients } from './document-campaign-recipients.entity'
import { DocumentTemplate, DocumentTemplateType } from './document-template.entity'
import { Institution } from './institutions.entity'
import { User } from './user.entity'

export enum DocumentCampaignStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export type InvoiceCampaignConfiguration = {
  invoices?: InvoiceItem[]
}

export type DocumentCampaignMetadata = InvoiceCampaignConfiguration // For another campaign type, you can define a different type

@Entity('document_campaign')
export class DocumentCampaign extends BaseEntity {
  @Index('IX_document_campaign_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution

  @Index('IX_document_campaign_document_id')
  @Column({
    name: 'document_id',
    type: 'int4',
    nullable: true,
  })
  documentId: number

  @Column({
    name: 'course_id',
    nullable: true,
    type: 'int4',
  })
  courseId?: number

  @Column({
    name: 'class_id',
    nullable: true,
    type: 'int4',
  })
  classId?: number

  @Column({ name: 'email_subject', type: 'varchar' })
  emailSubject: string

  @Column({ name: 'email_body', type: 'text' })
  emailBody: string

  @Column({ name: 'whatsapp_content', type: 'text', nullable: true })
  whatsappContent?: string

  @Column({ name: 'title', type: 'varchar' })
  title: string

  @Column({ name: 'user_id', type: 'int4', nullable: true })
  userId: number

  @Column()
  recipients: number

  @Column({ name: 'is_sent_only', type: 'boolean', default: false })
  isSentOnly: boolean

  @Column({
    name: 'status',
    type: 'enum',
    enum: DocumentCampaignStatus,
    default: DocumentCampaignStatus.PENDING,
  })
  status: DocumentCampaignStatus

  @ManyToOne(() => DocumentTemplate, (document) => document.campaigns, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'document_id' })
  document: DocumentTemplate

  @Column({ name: 'invoice_ids', type: 'jsonb', nullable: true })
  invoiceIds?: number[]

  @Column({ name: 'is_combined', type: 'boolean', default: false })
  isCombined: boolean

  @Column({ name: 'type', type: 'varchar', enum: DocumentTemplateType, nullable: true })
  type?: DocumentTemplateType

  @ManyToOne(() => User, (user) => user.documentCampaigns)
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => DocumentCampaignRecipients, (recipient) => recipient.campaign)
  recipientList: DocumentCampaignRecipients[]

  @Column({ name: 'send_via_email', type: 'bool', default: true })
  sendViaEmail?: boolean

  @Column({ name: 'send_via_whatsapp', type: 'bool', default: true })
  sendViaWhatsapp?: boolean

  @Column({ name: 'metadata', type: 'jsonb', default: {} })
  metadata?: DocumentCampaignMetadata

  @Column({ name: 'job_id', type: 'varchar', nullable: true })
  jobId?: string
}
