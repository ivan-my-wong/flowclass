import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('credit_settings')
export class CreditSettings extends BaseEntity {
  @Index('IX_credit_settings_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean

  @Column({
    name: 'conversion_rate',
    type: 'numeric',
    default: 1,
  })
  conversionRate: number // 1 credit = X currency units

  @Column({
    name: 'currency_code',
    type: 'varchar',
    nullable: true,
  })
  currencyCode?: string // e.g. 'HKD'

  @Column({
    name: 'credit_expiry_days',
    type: 'int',
    nullable: true,
  })
  creditExpiryDays?: number

  @Column({
    name: 'min_credit_usage',
    type: 'numeric',
    default: 0,
  })
  minCreditUsage?: number // minimum credit usage per transaction

  @Column({
    name: 'max_credit_per_transaction',
    type: 'numeric',
    nullable: true,
  })
  maxCreditPerTransaction?: number
}
