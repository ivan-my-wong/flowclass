import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { PromotionType } from '@/models/enums'
import { PromotionUsedStatus } from '@/models/enums/status'
import { BaseEntity } from '@/modules/base/base.entity'

import { Invoice } from './invoice.entity'

@Entity('invoice_promotion_used')
export class InvoicePromotionUsed extends BaseEntity {
  @Index('IX_invoice_promotion_used_invoice_id')
  @Column({ name: 'invoice_id' })
  invoiceId: number

  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({
    name: 'promotion_type',
    type: 'varchar',
    enum: PromotionType,
  })
  promotionType: PromotionType

  @Column({ name: 'promotion_id', nullable: true })
  promotionId: number | null

  @Column({ name: 'name', nullable: true })
  name: string | null

  @Column({ name: 'amount', type: 'numeric', default: 0 })
  amount: number

  @Column({
    name: 'used_status',
    type: 'varchar',
    enum: PromotionUsedStatus,
    default: PromotionUsedStatus.REDEEMED,
    nullable: true,
  })
  usedStatus: PromotionUsedStatus | null

  @ManyToOne(() => Invoice, (invoice) => invoice.invoicePromotionsUsed, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice
}
