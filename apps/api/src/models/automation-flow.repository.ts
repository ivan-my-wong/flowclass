/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { AutomationFlowStep } from './automation-flow-steps.entity'
import { AutomationFlow } from './automation-flow.entity'
import { InstitutionAutomationFlow } from './institution-automation-flow.entity'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Raw, Repository } from 'typeorm'

@Injectable()
export class AutomationFlowStepRepository extends BaseAbstractRepository<AutomationFlowStep> {
  private _repository: Repository<AutomationFlowStep>

  constructor(
    @InjectRepository(AutomationFlowStep)
    repository: Repository<AutomationFlowStep>
  ) {
    super(repository)
    this._repository = repository
  }

  async findByFunctionName(institutionId: number, functionName: string) {
    return await this._repository.findOne({
      where: {
        automationFunction: Raw((alias) => `${alias} @> :value`, {
          value: JSON.stringify({ functionName }),
        }),
        automationFlow: {
          institutionAutomationFlow: {
            institutionId,
          },
        },
      },
      relations: {
        whatsappTemplate: true,
        automationFlow: {
          institutionAutomationFlow: true,
        },
      },
    })
  }
}

@Injectable()
export class InstitutionAutomationFlowRepository extends BaseAbstractRepository<InstitutionAutomationFlow> {
  private _repository: Repository<InstitutionAutomationFlow>

  constructor(
    @InjectRepository(InstitutionAutomationFlow)
    repository: Repository<InstitutionAutomationFlow>
  ) {
    super(repository)
    this._repository = repository
  }
}

@Injectable()
export class AutomationFlowRepository extends BaseAbstractRepository<AutomationFlow> {
  private _repository: Repository<AutomationFlow>
  constructor(
    @InjectRepository(AutomationFlow)
    repository: Repository<AutomationFlow>,
    private automationStepRepository: AutomationFlowStepRepository,
    private institutionAutomationRepository: InstitutionAutomationFlowRepository
  ) {
    super(repository)
    this._repository = repository
  }
}
