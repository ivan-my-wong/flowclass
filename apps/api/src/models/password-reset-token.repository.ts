import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { PasswordResetToken } from './password-reset-token.entity'

@Injectable()
export class PasswordResetTokenRepository extends BaseAbstractRepository<PasswordResetToken> {
  private _repository: Repository<PasswordResetToken>

  constructor(
    @InjectRepository(PasswordResetToken)
    repository: Repository<PasswordResetToken>
  ) {
    super(repository)
    this._repository = repository
  }
}
