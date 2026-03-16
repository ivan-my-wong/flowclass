import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { UserAlias } from './user-aliases.entity'

@Injectable()
export class UserAliasesRepository extends BaseAbstractRepository<UserAlias> {
  private _repository: Repository<UserAlias>

  constructor(
    @InjectRepository(UserAlias)
    repository: Repository<UserAlias>
  ) {
    super(repository)
    this._repository = repository
  }

  async findOneByUserId(institutionId: number, userId: number) {
    return this._repository.findOneBy({
      institutionId,
      userId,
    })
  }

  async findOneByUserIdAndName(institutionId: number, userId: number, name: string) {
    return this._repository.findOne({
      where: {
        institutionId,
        userId,
        name: Like(`%${name}%`),
      },
      relations: {
        user: true,
      },
    })
  }

  async findOneByEmailAndName(institutionId: number, email: string, name: string) {
    return this._repository.findOne({
      where: {
        institutionId,
        user: {
          email: Like(`%${email}%`),
        },
        name: Like(`%${name}%`),
      },
      relations: {
        user: true,
      },
    })
  }

  async findFirstByUserIdAndInstitution(
    institutionId: number,
    userId: number,
    relations?: { user?: boolean }
  ): Promise<UserAlias | null> {
    return this._repository.findOne({
      where: { institutionId, userId },
      order: { id: 'ASC' },
      relations,
    })
  }

  async findOrCreate(params: {
    institutionId: number
    userId: number
    alias: string
    phone?: string
  }) {
    let userAlias = await this.findOneByUserIdAndName(
      params.institutionId,
      params.userId,
      params.alias
    )
    if (!userAlias) {
      userAlias = await this.create({
        institutionId: params.institutionId,
        userId: params.userId,
        name: params.alias,
      })
      await this.insert(userAlias)
    }
    return userAlias
  }

  async findOrCreateByUserIdAndInstitution(
    institutionId: number,
    userId: number,
    defaultName: string
  ): Promise<UserAlias> {
    let userAlias = await this.findFirstByUserIdAndInstitution(institutionId, userId)
    if (!userAlias) {
      userAlias = this._repository.create({
        institutionId,
        userId,
        name: defaultName,
      })
      userAlias = await this._repository.save(userAlias)
    }
    return userAlias
  }
}
