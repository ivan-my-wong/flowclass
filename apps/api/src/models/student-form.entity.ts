import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { FieldType } from './common-field.entity'
import { UserAlias } from './user-aliases.entity'

export class StudentFormMetadata {
  id: string
  type: FieldType
  value: string | number | string[] | boolean
  question: string
  isDefault?: boolean
  order?: number
  columnMapping?: string
}

@Entity('student_form')
export class StudentForm extends BaseEntity {
  @Index('IX_student_form_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'user_alias_id', nullable: true })
  userAliasId: number

  @Column({ name: 'form_id', default: null, nullable: true })
  formId: number

  // @deprecated Use formFieldId instead
  @Column({ name: 'field_id', default: null, nullable: true })
  fieldId: string

  // @deprecated Use formFieldId, formFieldQuestion, formFieldType, formFieldValue, formFieldIsDefault, formFieldOrder, formFieldColumnMapping instead
  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata?: StudentFormMetadata

  @Column({ name: 'form_field_id', nullable: true, comment: 'Refers to metadata.id' })
  formFieldId?: string

  @Column({ name: 'form_field_question', nullable: true, comment: 'Refers to metadata.question' })
  formFieldQuestion?: string

  @Column({
    name: 'form_field_type',
    nullable: true,
    comment: 'Refers to metadata.type',
    type: 'varchar',
    enum: FieldType,
  })
  formFieldType: FieldType

  @Column({ name: 'form_field_value', nullable: true, comment: 'Refers to metadata.value' })
  formFieldValue?: string

  @Column({
    name: 'form_field_is_default',
    nullable: true,
    comment: 'Refers to metadata.isDefault',
  })
  formFieldIsDefault?: boolean

  @Column({ name: 'form_field_order', nullable: true, comment: 'Refers to metadata.order' })
  formFieldOrder?: number

  @Column({
    name: 'form_field_column_mapping',
    nullable: true,
    comment: 'Refers to metadata.columnMapping',
  })
  formFieldColumnMapping?: string

  @ManyToOne(() => UserAlias, (userAlias) => userAlias.studentForms, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_alias_id' })
  userAlias: UserAlias
}
