import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

import {
  CreateSettingSocialDTO,
  UpdateSettingSocialDTO,
} from '@/application/admin/setting-social/dto/setting-social'
import { SettingSocial } from '@/models/setting-social.entity'
import { SettingSocialRepository } from '@/models/setting-social.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SettingSocialService extends BaseService<SettingSocial> {
  constructor(private settingSocialRepository: SettingSocialRepository) {
    super(settingSocialRepository)
  }

  async create(dto: CreateSettingSocialDTO) {
    const settingSocial = await this.findOneByInstitution(dto.institutionId)

    if (settingSocial) {
      return await this.settingSocialRepository.save({
        ...settingSocial,
        ...dto,
      })
    }

    return this.settingSocialRepository.save(this.settingSocialRepository.create(dto))
  }

  async update(
    id: number,
    updateSettingSocialDTO: UpdateSettingSocialDTO
  ): Promise<UpdateSettingSocialDTO> {
    const settingSocial = await this.settingSocialRepository.findOneBy({ id })

    if (!settingSocial) {
      throw new BadRequestException('SETTING_SOCIAL_NOT_FOUND')
    }

    const siteInstance = plainToInstance(SettingSocial, {
      ...settingSocial,
      ...updateSettingSocialDTO,
    })
    const institutionUpdated = await this.settingSocialRepository.save(siteInstance)
    return plainToInstance(UpdateSettingSocialDTO, institutionUpdated)
  }

  async findOneByInstitution(institutionId: number): Promise<SettingSocial> {
    return await this.settingSocialRepository.findOneBy({ institutionId })
  }

  async remove(id: number) {
    const settingSocial = await this.settingSocialRepository.findOneBy({ id })
    if (!settingSocial) {
      throw new BadRequestException('SETTING_SOCIAL_NOT_FOUND')
    }
    await this.settingSocialRepository.softRemove(settingSocial)

    return true
  }
}
