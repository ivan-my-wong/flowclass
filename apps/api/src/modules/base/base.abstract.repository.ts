/* eslint-disable simple-import-sort/imports */

import { plainToInstance } from 'class-transformer'
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm'

import { ClassAsParam } from '@/models/custom-types/time-format'

import { BaseInterfaceRepository } from './base.interface.repository'

import { PageMetaDto } from 'src/common/pagination/page-meta.dto'
import { PageOptionsDto } from 'src/common/pagination/page-options.dto'
import { PageDto } from 'src/common/pagination/page.dto'

export abstract class BaseAbstractRepository<T>
  extends Repository<T>
  implements BaseInterfaceRepository<T>
{
  private repository: Repository<T>

  protected constructor(repository: Repository<T>) {
    super(repository.target, repository.manager, repository.queryRunner)
    this.repository = repository
  }

  public async createOrUpdate(data: T | any): Promise<T[]> {
    return await this.repository.save(data)
  }

  public async findOneById(id: number | string, options?: FindOneOptions<T>): Promise<T> {
    const condition = {
      where: { id },
      ...options,
    } as FindOneOptions
    return this.repository.findOneOrFail(condition)
  }

  public async findOne(condition: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(condition)
  }

  async findOneOrCreate(condition: FindOneOptions<T>, createCondition: DeepPartial<T>): Promise<T> {
    const result = await this.repository.findOne(condition)
    if (result) {
      return result
    }
    const entity = this.repository.create(createCondition)
    return this.repository.save(entity)
  }

  public async findByCondition(filterCondition: any): Promise<T> {
    return await this.repository.findOne({ where: filterCondition })
  }

  public async findWithRelations(relations: any): Promise<T[]> {
    return await this.repository.find(relations)
  }

  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options)
  }

  public async query(queryString: string): Promise<T[]> {
    return await this.repository.query(queryString)
  }

  public async count(condition?: FindManyOptions): Promise<number> {
    return await this.repository.count(condition)
  }

  public async existedBy(condition?: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.countBy(condition)
    return count > 0
  }

  public async pagination(
    pageOptionsDto: PageOptionsDto,
    whereCondition?: FindOptionsWhere<T>,
    orderOption?: FindOptionsOrder<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>
  ): Promise<PageDto<T>> {
    const itemCount = await this.repository.count({
      where: {
        ...whereCondition,
      },
    })
    if (!pageOptionsDto.num || pageOptionsDto.num == 0) {
      pageOptionsDto.num = itemCount
    }

    if (!pageOptionsDto.page || pageOptionsDto.page == 0 || pageOptionsDto.num == itemCount) {
      pageOptionsDto.page = 1
    }

    const entities = await this.repository.find({
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.num || 0,
      take: pageOptionsDto.num,
      where: {
        ...whereCondition,
      },
      order: {
        ...orderOption,
      },
      relations,
      select,
    })
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto })
    return new PageDto<T>(entities, pageMetaDto)
  }

  public async getCount(
    whereCondition?: FindOptionsWhere<T>,
    orderOption?: FindOptionsOrder<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>
  ): Promise<number> {
    return await this.repository.count({
      where: {
        ...whereCondition,
      },
      order: {
        ...orderOption,
      },
      relations,
      select,
    })
  }

  public async paginationWithTransform<R>(
    pageOptionsDto: PageOptionsDto,
    dto: ClassAsParam<R>,
    whereCondition?: FindOptionsWhere<T>,
    orderOption?: FindOptionsOrder<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>,
    withDeleted?: boolean,
    // Additional filter function to filter entities before returning
    // Sometime we need to filter entities before returning to client
    additionalFilterFn?: (entities: T[]) => T[] | Promise<T[]>
  ): Promise<PageDto<R>> {
    let itemCount = await this.repository.count({
      where: {
        ...whereCondition,
      },
      withDeleted,
    })
    if (!pageOptionsDto.num || pageOptionsDto.num == 0) {
      pageOptionsDto.num = itemCount
    }

    if (!pageOptionsDto.page || pageOptionsDto.page == 0 || pageOptionsDto.num == itemCount) {
      pageOptionsDto.page = 1
    }
    let entities = await this.repository.find({
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.num || 0,
      take: pageOptionsDto.num,
      where: {
        ...whereCondition,
      },
      order: {
        ...orderOption,
      },
      relations,
      select,
      withDeleted,
    })
    // Apply additional filter function if provided
    // This is useful when we need to filter entities before returning to client
    if (additionalFilterFn) {
      entities = await additionalFilterFn(entities)
      itemCount = entities.length
    }
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto })
    const content = plainToInstance(dto, entities)
    return new PageDto<R>(content, pageMetaDto)
  }
}
