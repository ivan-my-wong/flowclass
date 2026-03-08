import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

export enum FieldType {
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  NUMBER = 'NUMBER',
  PHONE = 'PHONE',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  DROPDOWN_LIST = 'DROPDOWN_LIST',
  SWITCH = 'SWITCH',
  COUNTRY = 'COUNTRY',
  HEADING = 'HEADING',
  DESCRIPTION = 'DESCRIPTION',
  STEP_SEPARATOR = 'STEP_SEPARATOR',
  IMAGE = 'IMAGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
}

export enum FieldMapping {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum FieldStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('common_field')
export class CommonField extends BaseEntity {
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ length: 255, nullable: false })
  question: string

  @Column({ nullable: true })
  description: string

  @Column({ type: 'enum', enum: FieldType, default: FieldType.SHORT_ANSWER })
  type: FieldType

  @Column({ type: 'enum', enum: FieldStatus, default: FieldStatus.ACTIVE })
  status: FieldStatus

  @Column({ type: 'jsonb', nullable: true })
  option: string[]

  @Column({ nullable: false, default: 1 })
  order: number

  @Column({ name: 'is_require', type: 'boolean', default: false })
  isRequire: boolean

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean

  @Column({ name: 'column_mapping', default: null, nullable: true })
  columnMapping: string
}
