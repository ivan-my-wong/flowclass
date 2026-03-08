import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Coupon } from './coupons.entity'

@Injectable()
export class CouponsRepository extends BaseAbstractRepository<Coupon> {
  private _repository: Repository<Coupon>

  constructor(
    @InjectRepository(Coupon)
    repository: Repository<Coupon>
  ) {
    super(repository)
    this._repository = repository
  }
}
