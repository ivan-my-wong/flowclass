import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In } from 'typeorm'

import { ApiError } from '@/common/api-formats/api-error'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassPriceOptionRepository } from '@/models/class-price-options.repository'
import { PriceType } from '@/models/enums'
import { User } from '@/models/user.entity'

@Injectable()
export class ClassPriceOptionService {
  constructor(
    @InjectRepository(ClassPriceOption)
    private readonly classPriceOptionRepository: ClassPriceOptionRepository
  ) {}

  async createForClass(
    classId: number,
    priceType: PriceType,
    options: Partial<ClassPriceOption>[],
    user: User,
    manager: EntityManager = this.classPriceOptionRepository.manager
  ): Promise<ClassPriceOption[]> {
    return await manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(ClassPriceOption, { classId })

      if (priceType !== PriceType.MULTIPLE_OPTIONS && options.length > 1) {
        options = [options[0]]
      }

      const entities = options.map((option) => {
        if (option.amount == null || option.numberOfLessons == null) {
          throw new BadRequestException('amount and numberOfLessons are required')
        }

        const entity = new ClassPriceOption()
        entity.classId = classId
        entity.name = option.name || 'Default'
        entity.priceType = option.priceType || priceType
        entity.amount = option.amount
        entity.numberOfLessons = option.numberOfLessons
        entity.createdBy = user.id
        entity.updatedBy = user.id
        return entity
      })

      return await transactionalEntityManager.save(ClassPriceOption, entities)
    })
  }

  async getByClassId(classId: number): Promise<ClassPriceOption[]> {
    return this.classPriceOptionRepository.find({ where: { classId } })
  }

  async getByClassIds(classIds: number[]): Promise<ClassPriceOption[]> {
    if (!classIds || classIds.length === 0) {
      return []
    }

    return this.classPriceOptionRepository.find({
      where: {
        classId: In(classIds),
      },
      order: {
        id: 'ASC',
      },
    })
  }

  async getById(id: number): Promise<ClassPriceOption> {
    const option = await this.classPriceOptionRepository.findOne({ where: { id } })
    if (!option) {
      throw new NotFoundException(`Price option with ID ${id} not found`)
    }
    return option
  }

  async getPriceOptionForClass(classId: number, priceOptionId: number): Promise<ClassPriceOption> {
    const priceOption = await this.classPriceOptionRepository.findOne({
      where: { id: priceOptionId, classId },
    })
    if (!priceOption) {
      throw new ApiError(ErrorCode.PRICE_OPTION_NOT_FOUND)
    }
    return priceOption
  }
}
