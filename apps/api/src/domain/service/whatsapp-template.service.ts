import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { FindOptionsOrder, FindOptionsWhere, In, IsNull, Like, Not } from 'typeorm'

import {
  WhatsappTemplateDTO,
  WhatsappTemplateResponseDTO,
} from '@/application/admin/whatsapp-template/dto/whatsapp-template.dto'
import {
  WhatsappTemplatePageDto,
  WhatsappTemplatePaginationDTO,
} from '@/application/admin/whatsapp-template/dto/whatsapp-template-pagination.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { WhatsappTemplateErrorMessage } from '@/exceptions/error-message/whatsapp-template'
import { WhatsappTemplateStatus } from '@/models/enums/status'
import {
  WhatsappTemplateEntity,
  WhatsappTemplateRepository,
} from '@/models/whatsapp-template.entity'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class WhatsappTemplateService extends BaseService<WhatsappTemplateEntity> {
  constructor(private readonly repository: WhatsappTemplateRepository) {
    super(repository)
  }

  async getAllUnapproved(): Promise<WhatsappTemplateEntity[]> {
    return this.repository.find({
      where: {
        status: Not(In([WhatsappTemplateStatus.APPROVED, WhatsappTemplateStatus.REJECTED])),
      },
    })
  }

  async getAllTemplates(
    queryParams: WhatsappTemplatePaginationDTO
  ): Promise<WhatsappTemplatePageDto> {
    const { institutionId } = queryParams
    const findOptionsWhere: FindOptionsWhere<WhatsappTemplateEntity> = {
      institutionId,
    }
    if (queryParams) {
      Object.keys(queryParams)
        .filter((key) => ['name', 'assignedTo', 'status'].includes(key))
        .forEach((key) => {
          if (key === 'name' && queryParams[key] !== '') {
            findOptionsWhere[key] = Like(`%${queryParams[key]}%`)
          } else if (![0, '0', 'ALL', 'all'].includes(queryParams[key]) && queryParams[key]) {
            findOptionsWhere[key] = queryParams[key]
          }
        })
    }
    const orderOption: FindOptionsOrder<WhatsappTemplateEntity> = {}
    if (queryParams.orderBy) {
      orderOption[queryParams.orderBy] = queryParams.order
    }
    return this.repository.paginationWithTransform(
      queryParams,
      WhatsappTemplateResponseDTO,
      findOptionsWhere,
      orderOption
    )
  }

  getDefaultTemplates(institutionId: number): Promise<WhatsappTemplateEntity[]> {
    // Get the default whatsappTemplate and should be approved wa template
    return this.repository.find({
      where: {
        institutionId,
        isDefault: true,
        status: WhatsappTemplateStatus.APPROVED,
        twilioContentId: Not(IsNull()),
      },
    })
  }

  async getTemplateById(id: number, institutionId: number): Promise<WhatsappTemplateEntity> {
    let template = await this.repository.findOne({
      where: {
        id,
        institutionId,
      },
    })
    if (!template) {
      throw new ApiError(WhatsappTemplateErrorMessage.TEMPLATE_NOT_FOUND)
    }
    template = await this.updateApprovalStatus(template)
    return template
  }

  async getTemplateByContentSid(
    contentSid: string,
    institutionId: number
  ): Promise<WhatsappTemplateEntity> {
    const template = await this.repository.findOne({
      where: {
        twilioContentId: contentSid,
        institutionId,
      },
    })
    if (!template) {
      throw new ApiError(WhatsappTemplateErrorMessage.TEMPLATE_NOT_FOUND)
    }
    return template
  }

  async approvalRequest(whatsappTemplate: WhatsappTemplateEntity): Promise<WhatsappTemplateEntity> {
    whatsappTemplate.status = WhatsappTemplateStatus.APPROVED
    return this.repository.save(whatsappTemplate)
  }

  async submitApprovalRequest(id: number, institutionId: number): Promise<WhatsappTemplateEntity> {
    const whatsappTemplate = await this.getTemplateById(id, institutionId)
    if (whatsappTemplate.twilioContentId) {
      return this.approvalRequest(whatsappTemplate)
    }
    return whatsappTemplate
  }

  createWhatsappTemplateName(name: string, language: string, institutionId: number): string {
    return `${language}_${institutionId}_${name}`
  }

  private createLocalTemplateReference(): string {
    return `local-${randomUUID()}`
  }

  async createWhatsappTemplate(
    institutionId: number,
    payload: WhatsappTemplateDTO
  ): Promise<WhatsappTemplateEntity> {
    try {
      const whatsappTemplate = await this.repository.create(payload)

      whatsappTemplate.institutionId = institutionId
      whatsappTemplate.status = WhatsappTemplateStatus.APPROVED
      whatsappTemplate.twilioContentId = this.createLocalTemplateReference()

      return this.repository.save(whatsappTemplate)
    } catch (error) {
      throw new ApiError(WhatsappTemplateErrorMessage.TEMPLATE_NOT_CREATED)
    }
  }

  async updateApprovalStatus(
    whatsappTemplate: WhatsappTemplateEntity
  ): Promise<WhatsappTemplateEntity> {
    if (!whatsappTemplate.twilioContentId) return whatsappTemplate
    if (whatsappTemplate.status !== WhatsappTemplateStatus.APPROVED) {
      whatsappTemplate.status = WhatsappTemplateStatus.APPROVED
      return this.repository.save(whatsappTemplate)
    }
    return whatsappTemplate
  }

  async updateWhatsappTemplate(
    id: number,
    institutionId: number,
    payload: WhatsappTemplateDTO
  ): Promise<WhatsappTemplateEntity> {
    let whatsappTemplate = await this.getTemplateById(id, institutionId)
    whatsappTemplate = await this.repository.save({
      ...whatsappTemplate,
      ...payload,
      status: WhatsappTemplateStatus.APPROVED,
      twilioContentId: whatsappTemplate.twilioContentId || this.createLocalTemplateReference(),
    })
    return this.repository.save(whatsappTemplate)
  }

  async deleteWhatsappTemplate(id: number, institutionId: number): Promise<void> {
    const whatsappTemplate = await this.getTemplateById(id, institutionId)
    await this.repository.remove(whatsappTemplate)
  }
}
