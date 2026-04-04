import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, FindOptionsWhere, QueryFailedError } from 'typeorm'

import {
  CreatePackageDiscountDto,
  PackageDiscountsPageOptionDto,
  UpdatePackageDiscountDto,
} from '@/application/admin/promotions/dto/package-discounts.dto'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { PackageDiscount } from '@/models/package-discounts.entity'
import { PackageDiscountsRepository } from '@/models/package-discounts.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class PackageDiscountsService extends BaseService<PackageDiscount> {
  private readonly logger = new Logger(PackageDiscountsService.name)

  constructor(
    @InjectRepository(PackageDiscountsRepository)
    private packageDiscountsRepository: PackageDiscountsRepository
  ) {
    super(packageDiscountsRepository)
  }

  async findAll(dto: PackageDiscountsPageOptionDto) {
    const whereCondition: FindOptionsWhere<PackageDiscount> = {}
    if (dto.institutionId) whereCondition.institutionId = dto.institutionId
    if (dto.siteId) whereCondition.siteId = dto.siteId

    const orderOption: FindOptionsOrder<PackageDiscount> = {}
    if (dto.orderBy) {
      const allowedFields = ['id', 'name', 'isActive', 'startDate']
      if (allowedFields.includes(dto.orderBy)) {
        orderOption[dto.orderBy] = dto.order
      }
    }

    try {
      return await this.packageDiscountsRepository.pagination(
        dto,
        whereCondition,
        orderOption,
        null
      )
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Invalid orderBy field or query error: ${error.message}`)
      }
      throw error
    }
  }

  async findById(id: number): Promise<PackageDiscount> {
    try {
      const packageDiscount = await this.packageDiscountsRepository.findOneBy({ id })
      if (!packageDiscount) {
        throw new BadRequestException(PromotionErrorMessage.PACKAGE_DISCOUNT_NOT_FOUND)
      }
      return packageDiscount
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          `Invalid package discount ID or query error: ${error.message}`
        )
      }
      throw error
    }
  }

  async findByClassId(
    classId: number,
    siteId: number,
    institutionId: number
  ): Promise<PackageDiscount[]> {
    const all = await this.packageDiscountsRepository.find({
      where: { isActive: true, siteId, institutionId },
    })

    return all.filter((pd) => {
      if (pd.isAllClasses) return true
      return pd.applicableClassIds?.includes(classId)
    })
  }

  async create({
    dto,
    siteId,
    institutionId,
  }: {
    dto: CreatePackageDiscountDto
    siteId: number
    institutionId: number
  }): Promise<PackageDiscount> {
    // Check for duplicate name
    const existing = await this.packageDiscountsRepository.findOne({
      where: { name: dto.name, siteId, institutionId },
    })
    if (existing) {
      throw new BadRequestException(PromotionErrorMessage.PACKAGE_DISCOUNT_ALREADY_EXIST)
    }

    const entity = this.packageDiscountsRepository.create({
      ...dto,
      siteId,
      institutionId,
    })

    return this.packageDiscountsRepository.save(entity)
  }

  async update(id: number, dto: UpdatePackageDiscountDto): Promise<PackageDiscount> {
    const existing = await this.findById(id)

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.packageDiscountsRepository.findOne({
        where: {
          name: dto.name,
          siteId: existing.siteId,
          institutionId: existing.institutionId,
        },
      })
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(PromotionErrorMessage.PACKAGE_DISCOUNT_ALREADY_EXIST)
      }
    }

    Object.assign(existing, dto)
    return this.packageDiscountsRepository.save(existing)
  }

  async remove(id: number): Promise<PackageDiscount> {
    const existing = await this.findById(id)
    return this.packageDiscountsRepository.softRemove(existing)
  }

  async toggleStatus(id: number): Promise<PackageDiscount> {
    const existing = await this.findById(id)
    existing.isActive = !existing.isActive
    return this.packageDiscountsRepository.save(existing)
  }
}
