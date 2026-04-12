import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { InstitutionGallery } from './institution-gallery.entity'

@Injectable()
export class InstitutionGalleryRepository extends BaseAbstractRepository<InstitutionGallery> {
  private _repository: Repository<InstitutionGallery>

  constructor(
    @InjectRepository(InstitutionGallery)
    repository: Repository<InstitutionGallery>
  ) {
    super(repository)
    this._repository = repository
  }
}
