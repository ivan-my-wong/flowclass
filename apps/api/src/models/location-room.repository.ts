import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { LocationRoom } from './location-room.entity'

@Injectable()
export class LocationRoomRepository extends BaseAbstractRepository<LocationRoom> {
  private _repository: Repository<LocationRoom>

  constructor(
    @InjectRepository(LocationRoom)
    repository: Repository<LocationRoom>
  ) {
    super(repository)
    this._repository = repository
  }
}
