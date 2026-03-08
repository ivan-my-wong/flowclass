import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToClass, plainToInstance } from 'class-transformer'
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm'

import { CreateSeoSettingDTO } from '@/application/admin/seo-settings/dto/create-seo-setting.dto'
import { SeoSettingDetailDto } from '@/application/admin/seo-settings/dto/seo-setting-detail.dto'
import {
  SeoSettingPageDto,
  SeoSettingPageOptionDto,
} from '@/application/admin/seo-settings/dto/seo-setting-pagination.dto'
import { UpdateSeoSettingDTO } from '@/application/admin/seo-settings/dto/update-seo-setting.dto'
import { SeoSettingErrorMessage } from '@/exceptions/error-message/seo-setting'
import { SeoSetting } from '@/models/seo-setting.entity'
import { SeoSettingsRepository } from '@/models/seo-setting.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SeoSettingsService extends BaseService<SeoSetting> {
  constructor(private seoSettingsRepository: SeoSettingsRepository) {
    super(seoSettingsRepository)
  }

  async create(dto: CreateSeoSettingDTO) {
    const setting = await this.findOneByInstitution(dto.institutionId)

    if (setting) {
      return await this.seoSettingsRepository.save({ ...setting, ...dto })
    }

    return await this.seoSettingsRepository.save(this.seoSettingsRepository.create(dto))
  }

  findAll(pageOptionsDto: SeoSettingPageOptionDto): Promise<SeoSettingPageDto | SeoSetting[]> {
    // implementation for pagination
    const whereCondition: FindOptionsWhere<SeoSetting> = {}
    if (pageOptionsDto.siteId) {
      whereCondition.siteId = pageOptionsDto.siteId
    }

    if (pageOptionsDto.institutionId) {
      whereCondition.institutionId = pageOptionsDto.institutionId
    }

    const orderOption: FindOptionsOrder<SeoSetting> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }
    return this.seoSettingsRepository.paginationWithTransform(
      pageOptionsDto,
      SeoSettingDetailDto,
      whereCondition,
      orderOption
    )
  }

  async findOne(id: number): Promise<SeoSettingDetailDto> {
    const seoSetting = await this.seoSettingsRepository.findOneBy({ id })

    if (!seoSetting) {
      throw new BadRequestException(SeoSettingErrorMessage.SEO_SETTING_NOT_FOUND)
    }

    return plainToClass(SeoSettingDetailDto, seoSetting, {
      enableImplicitConversion: true,
    })
  }

  async update(id: number, updateSeoSettingDto: UpdateSeoSettingDTO): Promise<SeoSettingDetailDto> {
    const seoSetting = await this.seoSettingsRepository.findOneBy({ id })
    if (!seoSetting) {
      throw new BadRequestException(SeoSettingErrorMessage.SEO_SETTING_NOT_FOUND)
    }

    const seoSettingInstance = plainToInstance(SeoSetting, {
      ...seoSetting,
      ...updateSeoSettingDto,
    })

    const seoSettingUpdated = await this.seoSettingsRepository.save(seoSettingInstance)
    return plainToInstance(SeoSettingDetailDto, seoSettingUpdated)
  }

  async remove(id: number): Promise<SeoSettingDetailDto> {
    const seoSetting = await this.seoSettingsRepository.findOneBy({ id })
    if (!seoSetting) {
      throw new BadRequestException(SeoSettingErrorMessage.SEO_SETTING_NOT_FOUND)
    }
    const seoSettingRemoved = await this.seoSettingsRepository.softRemove(seoSetting)
    return plainToInstance(SeoSettingDetailDto, seoSettingRemoved)
  }

  async findOneByInstitution(institutionId: number): Promise<SeoSettingDetailDto> {
    return await this.seoSettingsRepository.findOneBy({
      institutionId,
    })
  }
}
