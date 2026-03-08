import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { SeoSetting } from './seo-setting.entity'

@Injectable()
export class SeoSettingsRepository extends BaseAbstractRepository<SeoSetting> {
  private _repository: Repository<SeoSetting>

  constructor(
    @InjectRepository(SeoSetting)
    repository: Repository<SeoSetting>
  ) {
    super(repository)
    this._repository = repository
  }
}
