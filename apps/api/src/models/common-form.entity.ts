import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

export enum FieldStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('common_form')
export class CommonForm extends BaseEntity {
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ length: 100, nullable: false })
  name: string

  @Column({ length: 255, nullable: true })
  description: string

  @Column({ type: 'enum', enum: FieldStatus, default: FieldStatus.ACTIVE })
  status: FieldStatus

  @Column({ type: 'jsonb', nullable: true })
  fields: string[]

  @Column({ nullable: false, default: 1 })
  order: number
}
