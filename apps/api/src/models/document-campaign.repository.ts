import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { DocumentCampaign } from './document-campaign.entity'

@Injectable()
export class DocumentCampaignRepository extends BaseAbstractRepository<DocumentCampaign> {
  constructor(
    @InjectRepository(DocumentCampaign)
    repository: Repository<DocumentCampaign>
  ) {
    super(repository)
  }
}
