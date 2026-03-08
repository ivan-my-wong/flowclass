import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity({ name: 'sites_feature_enabled' })
export class SitesFeatureEnabled extends BaseEntity {
  @Column({ name: 'feature', type: 'varchar', length: 255 })
  feature: string

  @Column({ name: 'site_ids', type: 'jsonb', default: [] })
  siteIds: number[]
}

@Injectable()
export class SitesFeatureEnabledRepository extends BaseAbstractRepository<SitesFeatureEnabled> {
  private _repository: Repository<SitesFeatureEnabled>

  constructor(
    @InjectRepository(SitesFeatureEnabled)
    repository: Repository<SitesFeatureEnabled>
  ) {
    super(repository)
    this._repository = repository
  }
}
