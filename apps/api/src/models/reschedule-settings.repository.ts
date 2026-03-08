import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { RescheduleSettings } from './reschedule-settings.entity'

@Injectable()
export class RescheduleSettingsRepository extends BaseAbstractRepository<RescheduleSettings> {
  private _repository: Repository<RescheduleSettings>

  constructor(
    @InjectRepository(RescheduleSettings)
    repository: Repository<RescheduleSettings>
  ) {
    super(repository)
    this._repository = repository
  }
}
