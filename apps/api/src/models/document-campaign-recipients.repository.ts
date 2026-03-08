import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { DocumentCampaignRecipients } from './document-campaign-recipients.entity'

@Injectable()
export class DocumentCampaignRecipientsRepository extends BaseAbstractRepository<DocumentCampaignRecipients> {
  constructor(
    @InjectRepository(DocumentCampaignRecipients)
    repository: Repository<DocumentCampaignRecipients>
  ) {
    super(repository)
  }
}
