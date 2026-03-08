import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { CreditSettings } from './credit-settings.entity'

@Injectable()
export class CreditSettingsRepository extends BaseAbstractRepository<CreditSettings> {
  constructor(
    @InjectRepository(CreditSettings)
    repository: Repository<CreditSettings>
  ) {
    super(repository)
  }
}
