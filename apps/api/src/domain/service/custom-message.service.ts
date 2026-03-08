import { Injectable } from '@nestjs/common'

import {
  CreateCustomMessageDTO,
  SupportedType,
  SupportedTypeVariables,
  supportedTypeVariables,
} from '@/application/admin/custom-messages/dto/custom-message.dto'
import { DEFAULT_CUSTOM_MESSAGES } from '@/common/constants/custom-message'
import { CustomMessageEntity, CustomMessageRepository } from '@/models/custom-message.entity'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class CustomMessageService extends BaseService<CustomMessageEntity> {
  constructor(private readonly repository: CustomMessageRepository) {
    super(repository)
  }

  async createDefaultTemplates(institutionId: number) {
    const defaultTemplates = Object.entries(DEFAULT_CUSTOM_MESSAGES).map(([key, value]) => ({
      type: key,
      name: key.replace(/_/g, ' ').toUpperCase(),
      content: value,
      institutionId,
    }))
    return this.repository.save(defaultTemplates)
  }

  async getAllTemplates(institutionId: number) {
    return this.repository.findAll({
      where: {
        institutionId,
      },
    })
  }

  async getCustomMessageById(institutionId: number, id: number) {
    return this.repository.findOne({
      where: {
        id,
        institutionId,
      },
    })
  }
  async createOrUpdateCustomMessage(institutionId: number, body: CreateCustomMessageDTO) {
    const { id, ...payload } = body
    let customMessage: CustomMessageEntity | null = null
    if (id) {
      customMessage = await this.getCustomMessageById(institutionId, id)
      if (customMessage) {
        customMessage = this.repository.merge(customMessage, payload)
      }
    } else {
      customMessage = this.repository.create({
        ...payload,
        institutionId,
      })
    }
    return this.repository.save(customMessage)
  }

  async deleteCustomMessage(institutionId: number, id: number) {
    return this.repository.delete({
      id,
      institutionId,
    })
  }

  getCustomMessageType() {
    return Object.values(SupportedType)
  }

  getCustomMessageVariables() {
    return supportedTypeVariables
  }

  getPreparedData(): {
    types: SupportedType[]
    variables: SupportedTypeVariables[]
  } {
    return {
      types: Object.values(SupportedType),
      variables: supportedTypeVariables,
    }
  }

  async getCustomMessageByType(institutionId: number, type: SupportedType) {
    return this.repository.findOne({
      where: {
        type,
        institutionId,
      },
    })
  }
}
