import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { SettingSocial } from './setting-social.entity'

@Injectable()
export class SettingSocialRepository extends BaseAbstractRepository<SettingSocial> {
  private _repository: Repository<SettingSocial>

  constructor(
    @InjectRepository(SettingSocial)
    repository: Repository<SettingSocial>
  ) {
    super(repository)
    this._repository = repository
  }
}
