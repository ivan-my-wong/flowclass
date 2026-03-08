import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

export enum CertificateTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type TemplateFieldData = {
  id: string
  name: string
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

@Entity('template_management')
export class TemplateManagement extends BaseEntity {
  @Index('IX_template_management_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'status', type: 'enum', enum: CertificateTemplateStatus })
  status: CertificateTemplateStatus

  @Column({ name: 'campaigns', type: 'jsonb', nullable: true })
  campaigns?: {
    id: number
    name: string
    description: string
  }[]

  @Column({ name: 'field_data', type: 'jsonb', nullable: true })
  fieldData?: TemplateFieldData[]

  @Column({ name: 'background', type: 'jsonb', nullable: true })
  background?: TemplateBackgroundProps
}
