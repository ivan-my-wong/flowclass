import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { InviteMember } from './invite-member.entity'
import { UsersRepository } from './users.repository'

@Injectable()
export class InviteMembersRepository extends BaseAbstractRepository<InviteMember> {
  private _repository: Repository<InviteMember>

  constructor(
    @InjectRepository(InviteMember)
    repository: Repository<InviteMember>,
    private readonly usersRepository: UsersRepository
  ) {
    super(repository)
    this._repository = repository
  }
}
