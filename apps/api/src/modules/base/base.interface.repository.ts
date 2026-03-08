import { FindManyOptions, FindOptionsOrder, FindOptionsWhere } from 'typeorm'

import { PageDto } from 'src/common/pagination/page.dto'
import { PageOptionsDto } from 'src/common/pagination/page-options.dto'

export interface BaseInterfaceRepository<T> {
  createOrUpdate(data: T | any): Promise<T[]>

  findOneById(id: number | string): Promise<T>

  findByCondition(filterCondition: any): Promise<T>

  findAll(options?: FindManyOptions<T>): Promise<T[]>

  findWithRelations(relations: any): Promise<T[]>

  pagination(
    pageOptionsDto: PageOptionsDto,
    condition: FindOptionsWhere<T>,
    orderOption: FindOptionsOrder<T>
  ): Promise<PageDto<T>>
}
