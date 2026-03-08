// src/models/class-price-options.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { MediaMaterials } from './class-media-materials.entity'

@Injectable()
export class ClassMediaMaterialsRepository extends BaseAbstractRepository<MediaMaterials> {
  private _repository: Repository<MediaMaterials>

  constructor(
    @InjectRepository(MediaMaterials)
    repository: Repository<MediaMaterials>
  ) {
    super(repository)
    this._repository = repository
  }
}
