import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { SettingSite } from './setting-site.entity'

@Injectable()
export class SettingSiteRepository extends BaseAbstractRepository<SettingSite> {
  private _repository: Repository<SettingSite>

  constructor(
    @InjectRepository(SettingSite)
    repository: Repository<SettingSite>
  ) {
    super(repository)
    this._repository = repository
  }
}
