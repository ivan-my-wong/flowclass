import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { TemplateManagement } from './template-management.entity'

@Injectable()
export class TemplateManagementRepository extends BaseAbstractRepository<TemplateManagement> {
  constructor(
    @InjectRepository(TemplateManagement)
    repository: Repository<TemplateManagement>
  ) {
    super(repository)
  }
}
