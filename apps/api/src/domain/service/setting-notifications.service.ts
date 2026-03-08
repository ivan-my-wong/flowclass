import { Injectable, NotFoundException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

import {
  CreateSettingNotificationsDTO,
  UpdateSettingNotificationsDTO,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { SettingNotificationsMessage } from '@/exceptions/error-message/setting-notifications'
import {
  SettingNotifications,
  SettingNotificationsRepository,
} from '@/models/setting-notifications.entity'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SettingNotificationsService extends BaseService<SettingNotifications> {
  constructor(private settingNotificationsRepository: SettingNotificationsRepository) {
    super(settingNotificationsRepository)
  }

  async create(dto: CreateSettingNotificationsDTO) {
    const settingNotifications = await this.settingNotificationsRepository.findOneBy({
      institutionId: dto.institutionId,
    })

    if (settingNotifications) {
      return await this.settingNotificationsRepository.save({
        ...settingNotifications,
        ...dto,
      })
    }

    return this.settingNotificationsRepository.save(this.settingNotificationsRepository.create(dto))
  }

  async update(
    id: number,
    updateSettingNotificationsDTO: UpdateSettingNotificationsDTO
  ): Promise<UpdateSettingNotificationsDTO> {
    const settingNotifications = await this.settingNotificationsRepository.findOneBy({ id })

    if (!settingNotifications) {
      throw new NotFoundException(SettingNotificationsMessage.SETTING_NOTIFICATIONS_NOT_FOUND)
    }

    const siteInstance = plainToInstance(SettingNotifications, {
      ...settingNotifications,
      ...updateSettingNotificationsDTO,
    })
    const institutionUpdated = await this.settingNotificationsRepository.save(siteInstance)
    return plainToInstance(UpdateSettingNotificationsDTO, institutionUpdated)
  }

  async findOneByInstitution(institutionId: number): Promise<SettingNotifications> {
    const notiObj = await this.settingNotificationsRepository.findOneBy({
      institutionId,
    })

    if (!notiObj) {
      throw new NotFoundException(SettingNotificationsMessage.SETTING_NOTIFICATIONS_NOT_FOUND)
    }

    return notiObj
  }

  async remove(id: number) {
    const settingNotifications = await this.settingNotificationsRepository.findOneBy({ id })
    if (!settingNotifications) {
      throw new NotFoundException(SettingNotificationsMessage.SETTING_NOTIFICATIONS_NOT_FOUND)
    }
    await this.settingNotificationsRepository.softRemove(settingNotifications)

    return true
  }
}
