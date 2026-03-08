import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { SettingWebpageInstitution } from './setting-webpage-institutions.entity'

@Injectable()
export class SettingWebpageInstitutionRepository extends BaseAbstractRepository<SettingWebpageInstitution> {
  private _repository: Repository<SettingWebpageInstitution>

  constructor(
    @InjectRepository(SettingWebpageInstitution)
    repository: Repository<SettingWebpageInstitution>
  ) {
    super(repository)
    this._repository = repository
  }
}
