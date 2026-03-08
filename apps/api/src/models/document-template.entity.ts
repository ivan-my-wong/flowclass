import { Column, Entity, Index, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { DocumentCampaign } from './document-campaign.entity'

export enum DocumentTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DocumentTemplateType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CERTIFICATE = 'certificate',
}

export type TemplateFieldData = {
  id: string
  name: string
  field: string
  x: number
  y: number
  fontSize: number
  color: string
}

export type TemplateBackgroundProps = {
  url: string
  width: number
  height: number
}

@Entity('document_template')
export class DocumentTemplate extends BaseEntity {
  @Index('IX_document_template_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'status', type: 'enum', enum: DocumentTemplateStatus })
  status: DocumentTemplateStatus

  @OneToMany(() => DocumentCampaign, (document) => document.document)
  campaigns?: DocumentCampaign[]

  @Column({ name: 'field_data', type: 'jsonb', nullable: true })
  fieldData?: TemplateFieldData[]

  @Column({ name: 'background', type: 'jsonb', nullable: true })
  background?: TemplateBackgroundProps

  @Column({ name: 'type', type: 'enum', enum: DocumentTemplateType })
  type: DocumentTemplateType
}
