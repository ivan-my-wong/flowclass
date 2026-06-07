import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index } from 'typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { DivitEnvironment } from './divit-config.entity'

export type DivitOrderStatus = 'pending' | 'paid' | 'failed'

@Entity('divit_orders')
export class DivitOrder extends BaseEntity {
  @Index('IX_divit_orders_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_divit_orders_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_divit_orders_invoice_id')
  @Column({ name: 'invoice_id' })
  invoiceId: number

  @Index('IX_divit_orders_divit_order_id')
  @Column({ name: 'divit_order_id', nullable: true })
  divitOrderId: string

  @Column({ name: 'divit_order_token', nullable: true })
  divitOrderToken: string

  @Column({ name: 'redirect_url', nullable: true })
  redirectUrl: string

  @Column({ default: 'pending' })
  status: DivitOrderStatus

  @Column({ default: 'sandbox' })
  environment: DivitEnvironment
}

@Injectable()
export class DivitOrderRepository extends BaseAbstractRepository<DivitOrder> {
  private _repository: Repository<DivitOrder>

  constructor(
    @InjectRepository(DivitOrder)
    repository: Repository<DivitOrder>
  ) {
    super(repository)
    this._repository = repository
  }
}
