import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Site } from './site.entity'

@Injectable()
export class SitesRepository extends BaseAbstractRepository<Site> {
  private _repository: Repository<Site>

  constructor(
    @InjectRepository(Site)
    repository: Repository<Site>
  ) {
    super(repository)
    this._repository = repository
  }
}
