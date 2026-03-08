import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { FindOptionsOrder, FindOptionsWhere, ILike } from 'typeorm'

import {
  CreateSettingWebpageInstitutionDto,
  UpdateSettingWebpageInstitutionDto,
} from '@/application/admin/setting-webpage-institution/dto/setting-webpage-institution.dto'
import { SettingWebpageInstitutionDetailDto } from '@/application/admin/setting-webpage-institution/dto/setting-webpage-institution-detail.dto'
import {
  SettingWebpageInstitutionPageDto,
  SettingWebpageInstitutionPageOptionDto,
} from '@/application/admin/setting-webpage-institution/dto/setting-webpage-institution-pagination.dto'
import { SettingSiteErrorMessage } from '@/exceptions/error-message/setting-site'
import { SettingWebpageInstitution } from '@/models/setting-webpage-institutions.entity'
import { SettingWebpageInstitutionRepository } from '@/models/setting-webpage-institutions.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SettingWebpageInstitutionService extends BaseService<SettingWebpageInstitution> {
  constructor(private settingWebpageInstitutionRepository: SettingWebpageInstitutionRepository) {
    super(settingWebpageInstitutionRepository)
  }

  async create(dto: CreateSettingWebpageInstitutionDto) {
    const setting = await this.findOneByInstitution(dto.institutionId)

    if (setting) {
      const settingInstitution = await this.settingWebpageInstitutionRepository.save({
        ...setting,
        ...dto,
      })

      return plainToInstance(SettingWebpageInstitution, settingInstitution)
    }

    const settingInstitution = await this.settingWebpageInstitutionRepository.save(
      this.settingWebpageInstitutionRepository.create(dto)
    )

    return plainToInstance(SettingWebpageInstitution, settingInstitution)
  }

  async findOneByInstitution(institutionId: number): Promise<SettingWebpageInstitution> {
    return await this.settingWebpageInstitutionRepository.findOne({
      where: {
        institutionId,
      },
    })
  }

  findAll(
    pageOptionsDto: SettingWebpageInstitutionPageOptionDto
  ): Promise<SettingWebpageInstitutionPageDto | SettingWebpageInstitution[]> {
    const whereCondition: FindOptionsWhere<SettingWebpageInstitution> = {}
    if (pageOptionsDto.institutionId) {
      whereCondition.institutionId = pageOptionsDto.institutionId
    }

    if (pageOptionsDto.name) {
      whereCondition.name = ILike(`%${pageOptionsDto.name}%`)
    }

    const orderOption: FindOptionsOrder<SettingWebpageInstitution> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    return this.settingWebpageInstitutionRepository.paginationWithTransform(
      pageOptionsDto,
      SettingWebpageInstitutionDetailDto,
      whereCondition,
      orderOption
    )
  }

  async findOne(id: number): Promise<SettingWebpageInstitutionDetailDto> {
    const settingWebpage = await this.settingWebpageInstitutionRepository.findOneBy({ id })
    if (!settingWebpage) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    if (settingWebpage.deletedAt) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    return settingWebpage
  }

  async update(
    id: number,
    updateSettingWebpageDto: UpdateSettingWebpageInstitutionDto
  ): Promise<SettingWebpageInstitutionDetailDto> {
    const settingWebpage = await this.findOne(id)

    if (!settingWebpage) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    const settingInstance = plainToInstance(SettingWebpageInstitutionDetailDto, {
      ...settingWebpage,
      ...updateSettingWebpageDto,
    })
    const settingUpdated = await this.settingWebpageInstitutionRepository.save(settingInstance)
    return plainToInstance(SettingWebpageInstitutionDetailDto, settingUpdated)
  }

  async remove(id: number): Promise<SettingWebpageInstitutionDetailDto> {
    const settingWebpage = await this.settingWebpageInstitutionRepository.findOneBy({ id })
    if (!settingWebpage) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }
    const settingWebpageRemoved = await this.settingWebpageInstitutionRepository.softRemove(
      settingWebpage
    )

    return plainToInstance(SettingWebpageInstitutionDetailDto, settingWebpageRemoved)
  }
}
