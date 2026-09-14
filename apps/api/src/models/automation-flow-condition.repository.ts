/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AutomationFlowCondition } from './automation-flow-condition.entity'

@Injectable()
export class AutomationFlowConditionRepository extends BaseAbstractRepository<AutomationFlowCondition> {
  private _repository: Repository<AutomationFlowCondition>

  constructor(
    @InjectRepository(AutomationFlowCondition)
    repository: Repository<AutomationFlowCondition>
  ) {
    super(repository)
    this._repository = repository
  }
}
