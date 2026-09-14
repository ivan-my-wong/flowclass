import { Injectable } from '@nestjs/common'
import { FindOptionsOrder, FindOptionsWhere, In, Like, Not, Raw } from 'typeorm'

import {
  WhatsappTemplateDTO,
  WhatsappTemplateResponseDTO,
} from '@/application/admin/whatsapp-template/dto/whatsapp-template.dto'
import {
  WhatsappTemplatePageDto,
  WhatsappTemplatePaginationDTO,
} from '@/application/admin/whatsapp-template/dto/whatsapp-template-pagination.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { AutomationFunction, automationFunctions } from '@/common/constants/automationFlow'
import { AutomationFlowErrorMessage } from '@/exceptions/error-message/automation-flow'
import { AutomationFlowStepRepository } from '@/models/automation-flow.repository'
import { WhatsappTemplateStatus } from '@/models/enums/status'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionRepository,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'
import {
  WhatsappTemplateEntity,
  WhatsappTemplateRepository,
} from '@/models/whatsapp-template.entity'
import { BaseService } from '@/modules/base/base.service'

import { MetaGraphApiService } from '../external/meta/meta-graph-api.service'
import { WhatsAppProviderCredentialService } from '../external/meta/whatsapp-provider-credential.service'

@Injectable()
export class WhatsappTemplateService extends BaseService<WhatsappTemplateEntity> {
  constructor(
    private readonly repository: WhatsappTemplateRepository,
    private readonly automationFlowStepRepository: AutomationFlowStepRepository,
    private readonly connectionRepository: WhatsAppProviderConnectionRepository,
    private readonly credentialService: WhatsAppProviderCredentialService,
    private readonly graphApiService: MetaGraphApiService
  ) {
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
          } else if (![0, '0', 'ALL', 'all'].includes(queryParams[key])) {
            if (key === 'assignedTo') {
              findOptionsWhere[key] = automationFunctions[queryParams[key]]
            } else if (queryParams[key]) {
              findOptionsWhere[key] = queryParams[key]
            }
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

  async getDefaultTemplates(institutionId: number): Promise<WhatsappTemplateEntity[]> {
    return this.repository.find({
      where: {
        institutionId,
        isDefault: true,
        status: WhatsappTemplateStatus.APPROVED,
      },
    })
  }

  async getTemplateById(id: number, institutionId: number): Promise<WhatsappTemplateEntity> {
    const template = await this.repository.findOne({
      where: {
        id,
        institutionId,
      },
    })
    if (!template) {
      throw new ApiError('Template not found')
    }
    return template
  }

  async createWhatsappTemplate(
    institutionId: number,
    payload: WhatsappTemplateDTO
  ): Promise<WhatsappTemplateEntity> {
    try {
      const whatsappTemplate = this.repository.create(payload)
      whatsappTemplate.institutionId = institutionId
      whatsappTemplate.provider = WhatsAppProvider.META_CLOUD
      whatsappTemplate.status = WhatsappTemplateStatus.APPROVED

      // Check if Meta connection exists to create remote template
      const connection = await this.connectionRepository.findByInstitutionId(institutionId)
      const credential = await this.credentialService.getMeta(institutionId)
      if (
        connection &&
        connection.provider === WhatsAppProvider.META_CLOUD &&
        connection.status === WhatsAppProviderConnectionStatus.CONNECTED &&
        connection.wabaId &&
        credential?.accessToken
      ) {
        try {
          const remote = await this.graphApiService.createMessageTemplate(
            connection.wabaId,
            credential.accessToken,
            {
              name: payload.name.toLowerCase(),
              language: payload.language,
              category: payload.category || 'UTILITY',
              components: [
                {
                  type: 'BODY',
                  text: payload.content,
                },
              ],
            }
          )
          whatsappTemplate.metaTemplateId = remote.id
          whatsappTemplate.status =
            remote.status === 'APPROVED'
              ? WhatsappTemplateStatus.APPROVED
              : WhatsappTemplateStatus.PENDING
          whatsappTemplate.metaResponse = remote as any
        } catch (metaErr) {
          console.error('Meta Graph API template create non-fatal warning:', metaErr)
        }
      }

      if (whatsappTemplate.isDefault) {
        await this.checkAndChangeDefaultTemplate(institutionId, whatsappTemplate.assignedTo)
      }
      return this.repository.save(whatsappTemplate)
    } catch (error) {
      throw new ApiError('Failed to create WhatsApp template')
    }
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
    })

    if (whatsappTemplate.isDefault) {
      await this.checkAndChangeDefaultTemplate(institutionId, whatsappTemplate.assignedTo, id)
    }
    return whatsappTemplate
  }

  async submitApprovalRequest(id: number, institutionId: number): Promise<WhatsappTemplateEntity> {
    const whatsappTemplate = await this.getTemplateById(id, institutionId)
    // In Meta Cloud API, templates are automatically submitted for review upon creation/update.
    return whatsappTemplate
  }

  async checkAndChangeDefaultTemplate(
    institutionId: number,
    assignedTo: AutomationFunction,
    id?: number
  ): Promise<void> {
    const criteria = { institutionId, isDefault: true, assignedTo }
    if (id) {
      criteria['id'] = Not(id)
    }
    await this.repository.update(criteria, { isDefault: false })
  }

  async deleteWhatsappTemplate(id: number, institutionId: number): Promise<void> {
    const whatsappTemplate = await this.getTemplateById(id, institutionId)
    if (whatsappTemplate.metaTemplateId) {
      const connection = await this.connectionRepository.findByInstitutionId(institutionId)
      const credential = await this.credentialService.getMeta(institutionId)
      if (connection?.wabaId && credential?.accessToken) {
        try {
          await this.graphApiService.deleteMessageTemplate(
            connection.wabaId,
            credential.accessToken,
            {
              templateId: whatsappTemplate.metaTemplateId,
              name: whatsappTemplate.name,
            }
          )
        } catch (err) {
          console.error('Meta template delete warning:', err)
        }
      }
    }
    await this.repository.remove(whatsappTemplate)
  }

  async getTemplatesByAutomationStepId(stepId: number): Promise<WhatsappTemplateEntity[]> {
    const automationFlowStep = await this.automationFlowStepRepository.findOneById(stepId)
    if (!automationFlowStep) {
      throw new ApiError(AutomationFlowErrorMessage.STEP_NOT_FOUND)
    }
    const { automationFunction } = automationFlowStep
    const functionName = automationFunction.functionName
    return this.repository.findBy({
      assignedTo: Raw((alias) => `${alias} @> :value`, {
        value: JSON.stringify({ functionName }),
      }),
      status: WhatsappTemplateStatus.APPROVED,
    })
  }
}
