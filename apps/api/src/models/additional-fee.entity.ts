import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

import { AdditionalFeeConditions, DiscountType } from '@/models/enums/'
import { CouponStatus } from '@/models/enums/status'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('additional_fee')
export class AdditionalFee extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_additional_fee_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column({
    name: 'fee_type',
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED_AMOUNT,
  })
  feeType: DiscountType

  @Column({ name: 'amount' })
  amount: number

  @Column({
    name: 'status',
    enum: CouponStatus,
    type: 'enum',
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus

  @Column({
    name: 'condition',
    type: 'enum',
    enum: AdditionalFeeConditions,
    default: AdditionalFeeConditions.NEW_STUDENT,
  })
  condition: AdditionalFeeConditions

  @Column({ name: 'course_ids', type: 'int', array: true, default: [] })
  courseIds: number[]
}

@Injectable()
export class AdditionalFeeRepository extends BaseAbstractRepository<AdditionalFee> {
  private _repository: Repository<AdditionalFee>

  constructor(
    @InjectRepository(AdditionalFee)
    repository: Repository<AdditionalFee>
  ) {
    super(repository)
    this._repository = repository
  }
}
