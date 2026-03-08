import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Media } from './media.entity'

@Injectable()
export class MediaRepository extends BaseAbstractRepository<Media> {
  private _repository: Repository<Media>

  constructor(
    @InjectRepository(Media)
    repository: Repository<Media>
  ) {
    super(repository)
    this._repository = repository
  }
}
