import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { DocumentTemplate } from './document-template.entity'

@Injectable()
export class DocumentTemplateRepository extends BaseAbstractRepository<DocumentTemplate> {
  constructor(
    @InjectRepository(DocumentTemplate)
    repository: Repository<DocumentTemplate>
  ) {
    super(repository)
  }
}
