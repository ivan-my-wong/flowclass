import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { User } from './user.entity'

@Injectable()
export class UsersRepository extends BaseAbstractRepository<User> {
  private _repository: Repository<User>

  constructor(
    @InjectRepository(User)
    repository: Repository<User>
  ) {
    super(repository)
    this._repository = repository
  }
}
