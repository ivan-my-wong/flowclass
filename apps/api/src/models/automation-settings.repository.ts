/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AutomationSettings, AutomationSettingsType } from './automation-settings.entity'

@Injectable()
export class AutomationSettingsRepository extends BaseAbstractRepository<AutomationSettings> {
  constructor(
    @InjectRepository(AutomationSettings)
    repository: Repository<AutomationSettings>
  ) {
    super(repository)
  }

  async findByType(institutionId: number, type: AutomationSettingsType) {
    return await this.findOne({
      where: {
        institutionId,
        type,
      },
    })
  }
}
