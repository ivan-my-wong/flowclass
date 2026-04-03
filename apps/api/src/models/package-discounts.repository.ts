import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { PackageDiscount } from './package-discounts.entity'

@Injectable()
export class PackageDiscountsRepository extends BaseAbstractRepository<PackageDiscount> {
  private _repository: Repository<PackageDiscount>

  constructor(
    @InjectRepository(PackageDiscount)
    repository: Repository<PackageDiscount>
  ) {
    super(repository)
    this._repository = repository
  }
}
