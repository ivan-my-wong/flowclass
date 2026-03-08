import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BaseEntity } from '../modules/base/base.entity'

@Entity('institution_workflow')
export class InstitutionWorkflow extends BaseEntity {
  @Index('IX_institution_workflow_workflow_id')
  @Column({
    name: 'workflow_id',
    type: 'varchar',
  })
  workflowId: string

  @Index('IX_institution_workflow_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int',
  })
  institutionId: number
}

export class InstitutionWorkflowRepository extends BaseAbstractRepository<InstitutionWorkflow> {
  private _repository: Repository<InstitutionWorkflow>

  constructor(
    @InjectRepository(InstitutionWorkflow)
    repository: Repository<InstitutionWorkflow>
  ) {
    super(repository)
    this._repository = repository
  }
}

export default InstitutionWorkflowRepository
