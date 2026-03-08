import { BadRequestException } from '@nestjs/common'
import { FindOneOptions, FindOptionsRelations, FindOptionsWhere } from 'typeorm'

import { BaseAbstractRepository } from './base.abstract.repository'

export enum NotFoundMessage {
  NOT_FOUND = '#{1}_NOT_FOUND',
}

export class BaseService<T> {
  constructor(private readonly baseRepository: BaseAbstractRepository<T>) {}

  async findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
    return this.baseRepository.findOneBy(where)
  }

  async findOneCondition(condition: FindOneOptions<T>): Promise<T | null> {
    return this.baseRepository.findOne(condition)
  }

  async getOneOrFail(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: FindOptionsRelations<T>
  ) {
    const data = await this.baseRepository.findOne({
      where,
      relations,
    })
    if (!data) {
      throw new BadRequestException(
        NotFoundMessage.NOT_FOUND.replace('#{1}', this.baseRepository.metadata.name.toUpperCase())
      )
    }
    return data
  }
}
