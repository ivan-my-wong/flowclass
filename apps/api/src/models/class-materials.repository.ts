// src/models/class-price-options.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { ClassMaterials } from './class-materials.entity'

@Injectable()
export class ClassMaterialsRepository extends BaseAbstractRepository<ClassMaterials> {
  private _repository: Repository<ClassMaterials>

  constructor(
    @InjectRepository(ClassMaterials)
    repository: Repository<ClassMaterials>
  ) {
    super(repository)
    this._repository = repository
  }
}
