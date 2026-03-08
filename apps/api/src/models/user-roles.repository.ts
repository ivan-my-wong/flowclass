import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { UserRole } from './user-role.entity'

@Injectable()
export class UserRolesRepository extends BaseAbstractRepository<UserRole> {
  private _repository: Repository<UserRole>

  constructor(
    @InjectRepository(UserRole)
    repository: Repository<UserRole>
  ) {
    super(repository)
    this._repository = repository
  }
}
