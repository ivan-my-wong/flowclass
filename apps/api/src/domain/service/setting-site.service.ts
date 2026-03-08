import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { FindOptionsOrder, FindOptionsWhere, ILike } from 'typeorm'

import {
  CreateSettingSiteDto,
  UpdateDisplayEmailLogoDto,
  UpdateDisplayEmailLogoQueryDto,
  UpdateSettingSiteDto,
} from '@/application/admin/setting-site/dto/setting-site.dto'
import { SettingSiteDetailDto } from '@/application/admin/setting-site/dto/setting-site-detail.dto'
import {
  SettingSiteOptionDto,
  SettingSitePaginationDto,
} from '@/application/admin/setting-site/dto/setting-site-pagination.dto'
import { SettingSiteErrorMessage } from '@/exceptions/error-message/setting-site'
import { SettingSite } from '@/models/setting-site.entity'
import { SettingSiteRepository } from '@/models/setting-site.repository'
import { SitesRepository } from '@/models/sites.repository'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SettingSiteService extends BaseService<SettingSite> {
  constructor(
    private readonly settingSiteRepository: SettingSiteRepository,
    private readonly siteRepository: SitesRepository,
    private readonly userRolesRepository: UserRolesRepository
  ) {
    super(settingSiteRepository)
  }

  /**
   * Get timezone offset
   * @param siteId
   * @returns timeZoneOffset in hours
   */
  async getTimeZoneOffset(siteId: number): Promise<number | null> {
    const found = await this.settingSiteRepository.findOneBy({ siteId })
    if (!found) {
      return null
    }
    return found.zoneOffset
  }

  async getTimeZone(siteId: number): Promise<string | null> {
    const found = await this.settingSiteRepository.findOneBy({ siteId })
    if (!found) {
      return null
    }
    return found.timeZone ?? 'Asia/Hong_Kong'
  }

  async create(dto: CreateSettingSiteDto) {
    let setting = await this.findOneBySite(dto.siteId)
    const site = await this.siteRepository.findOneBy({ id: dto.siteId })
    const siteOwner = await this.userRolesRepository.findOne({
      where: {
        siteId: dto.siteId,
        isSiteManager: true,
      },
      relations: {
        user: true,
      },
    })

    if (setting) {
      setting = await this.settingSiteRepository.save({ ...setting, ...dto })
    } else {
      setting = await this.settingSiteRepository.save(this.settingSiteRepository.create(dto))

      if (site) {
        // Site created - analytics integration removed
      }
    }

    return setting
  }

  async findOneBySite(siteId: number): Promise<SettingSite> {
    return await this.settingSiteRepository.findOneBy({ siteId })
  }

  findAll(pageOptionsDto: SettingSiteOptionDto): Promise<SettingSitePaginationDto | SettingSite[]> {
    const whereCondition: FindOptionsWhere<SettingSite> = {}
    if (pageOptionsDto.siteId) {
      whereCondition.siteId = pageOptionsDto.siteId
    }

    if (pageOptionsDto.language) {
      whereCondition.language = ILike(`%${pageOptionsDto.language}%`)
    }

    const orderOption: FindOptionsOrder<SettingSite> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    return this.settingSiteRepository.paginationWithTransform(
      pageOptionsDto,
      SettingSiteDetailDto,
      whereCondition,
      orderOption
    )
  }

  async findOne(id: number): Promise<SettingSiteDetailDto> {
    const settingSite = await this.settingSiteRepository.findOneBy({ id })
    if (!settingSite) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    if (settingSite.deletedAt) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    return settingSite
  }

  async update(
    id: number,
    updateSettingSiteDto: UpdateSettingSiteDto
  ): Promise<SettingSiteDetailDto> {
    const settingSite = await this.settingSiteRepository.findOneBy({ id })
    if (!settingSite) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    const settingInstance = plainToInstance(SettingSiteDetailDto, {
      ...settingSite,
      ...updateSettingSiteDto,
    })
    const settingUpdated = await this.settingSiteRepository.save(settingInstance)
    return plainToInstance(SettingSiteDetailDto, settingUpdated)
  }

  async remove(id: number): Promise<SettingSiteDetailDto> {
    const settingSite = await this.settingSiteRepository.findOneBy({ id })
    if (!settingSite) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }
    const settingSiteRemoved = await this.settingSiteRepository.softRemove(settingSite)

    return plainToInstance(SettingSiteDetailDto, settingSiteRemoved)
  }

  async updateDisplayEmailLogo(
    updateDisplayEmailLogoQueryDto: UpdateDisplayEmailLogoQueryDto,
    updateDisplayEmailLogoDto: UpdateDisplayEmailLogoDto
  ): Promise<SettingSiteDetailDto> {
    const { siteId } = updateDisplayEmailLogoQueryDto
    const settingSite = await this.findOneBySite(siteId)
    if (!settingSite) {
      throw new BadRequestException(SettingSiteErrorMessage.SETTING_SITE_NOT_FOUND)
    }

    const settingInstance = plainToInstance(SettingSiteDetailDto, {
      ...settingSite,
      ...updateDisplayEmailLogoDto,
    })
    const settingUpdated = await this.settingSiteRepository.save(settingInstance)
    return plainToInstance(SettingSiteDetailDto, settingUpdated)
  }
}
