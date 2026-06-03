import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Unique } from 'typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

export type DivitEnvironment = 'sandbox' | 'production'

@Entity('divit_configs')
export class DivitConfig extends BaseEntity {
  @Index('IX_divit_configs_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_divit_configs_institution_id')
  @Unique('UQ_divit_configs_institution_id', ['institutionId'])
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'api_key_encrypted', nullable: true })
  apiKeyEncrypted: string

  @Column({ name: 'signature_key_encrypted', nullable: true })
  signatureKeyEncrypted: string

  @Column({ default: 'sandbox' })
  environment: DivitEnvironment

  @Column({ default: false })
  enabled: boolean
}

@Injectable()
export class DivitConfigRepository extends BaseAbstractRepository<DivitConfig> {
  private _repository: Repository<DivitConfig>

  constructor(
    @InjectRepository(DivitConfig)
    repository: Repository<DivitConfig>
  ) {
    super(repository)
    this._repository = repository
  }
}
