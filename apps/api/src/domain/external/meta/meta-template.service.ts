import { Injectable, NotFoundException } from '@nestjs/common'

import {
  CreateMetaTemplateDto,
  UpdateMetaTemplateDto,
} from '@/application/admin/meta/dto/meta-template.dto'
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

import { IMetaMessageTemplate, MetaGraphApiService } from './meta-graph-api.service'
import { WhatsAppProviderCredentialService } from './whatsapp-provider-credential.service'

@Injectable()
export class MetaTemplateService {
  constructor(
    private readonly templateRepository: WhatsappTemplateRepository,
    private readonly connectionRepository: WhatsAppProviderConnectionRepository,
    private readonly credentialService: WhatsAppProviderCredentialService,
    private readonly graphApiService: MetaGraphApiService
  ) {}

  async list(institutionId: number): Promise<WhatsappTemplateEntity[]> {
    return this.templateRepository.find({
      where: { institutionId, provider: WhatsAppProvider.META_CLOUD },
    })
  }

  async sync(institutionId: number): Promise<{
    templates: WhatsappTemplateEntity[]
    synchronized: number
  }> {
    const connection = await this.connectionRepository.findByInstitutionId(institutionId)
    if (
      connection?.provider !== WhatsAppProvider.META_CLOUD ||
      connection.status !== WhatsAppProviderConnectionStatus.CONNECTED ||
      !connection.wabaId
    ) {
      throw new NotFoundException('Connected Meta Cloud integration with a WABA is required.')
    }
    const credential = await this.credentialService.getMeta(institutionId)
    if (!credential) {
      throw new NotFoundException('Meta credentials are missing for this institution.')
    }
    const localTemplates = await this.list(institutionId)

    if (localTemplates.length === 0) {
      const remoteTemplates = await this.graphApiService.listMessageTemplates(
        connection.wabaId,
        credential.accessToken
      )
      for (const remote of remoteTemplates) {
        await this.upsert(institutionId, remote)
      }
      return {
        templates: await this.list(institutionId),
        synchronized: remoteTemplates.length,
      }
    }

    const nonApprovedTemplates = localTemplates.filter(
      (template) => template.status !== WhatsappTemplateStatus.APPROVED
    )

    let synchronized = 0
    for (const template of nonApprovedTemplates) {
      if (!template.metaTemplateId) continue
      const remote = await this.graphApiService.getMessageTemplate(
        template.metaTemplateId,
        credential.accessToken
      )
      if (remote) {
        await this.upsert(institutionId, remote)
        synchronized++
      }
    }

    return {
      templates: await this.list(institutionId),
      synchronized,
    }
  }

  async migrate(institutionId: number, sourceWabaId: string): Promise<void> {
    const { wabaId, accessToken } = await this.getContext(institutionId)
    await this.graphApiService.migrateMessageTemplates(wabaId, accessToken, sourceWabaId)
    await this.sync(institutionId)
  }

  async create(input: CreateMetaTemplateDto): Promise<WhatsappTemplateEntity> {
    const { wabaId, accessToken } = await this.getContext(input.institutionId)
    const response = await this.graphApiService.createMessageTemplate(wabaId, accessToken, {
      name: input.name,
      language: input.language,
      category: input.category,
      components: input.components,
    })
    return this.upsert(input.institutionId, {
      id: response.id,
      name: input.name,
      language: input.language,
      category: response.category || input.category,
      status: response.status || 'PENDING',
      components: input.components,
    })
  }

  async update(templateId: number, input: UpdateMetaTemplateDto): Promise<WhatsappTemplateEntity> {
    const template = await this.findOwnedTemplate(templateId, input.institutionId)
    const { accessToken } = await this.getContext(input.institutionId)
    if (!template.metaTemplateId) {
      throw new NotFoundException('Template has no Meta template ID')
    }
    await this.graphApiService.updateMessageTemplate(template.metaTemplateId, accessToken, {
      category: input.category,
      components: input.components,
    })
    return this.upsert(input.institutionId, {
      id: template.metaTemplateId,
      name: template.name,
      language: template.language,
      category: input.category || template.category,
      status: 'PENDING',
      components: input.components,
    })
  }

  async delete(templateId: number, institutionId: number): Promise<void> {
    const template = await this.findOwnedTemplate(templateId, institutionId)
    const { wabaId, accessToken } = await this.getContext(institutionId)
    if (template.metaTemplateId) {
      await this.graphApiService.deleteMessageTemplate(wabaId, accessToken, {
        templateId: template.metaTemplateId,
        name: template.name,
      })
    }
    await this.templateRepository.delete(template.id)
  }

  private async upsert(
    institutionId: number,
    remote: IMetaMessageTemplate
  ): Promise<WhatsappTemplateEntity> {
    const existing = await this.templateRepository.findOne({
      where: { institutionId, metaTemplateId: remote.id },
    })
    const body = remote.components?.find((component) => component.type?.toUpperCase() === 'BODY')
    const content = body?.text || ''
    const template =
      existing ??
      this.templateRepository.create({
        institutionId,
        provider: WhatsAppProvider.META_CLOUD,
        metaTemplateId: remote.id,
      })
    template.name = remote.name
    template.friendlyName = remote.name
    template.status = this.mapStatus(remote.status)
    template.category = remote.category.toLowerCase()
    template.language = remote.language
    template.content = content
    template.contentType = 'meta/template'
    template.variables = this.extractVariables(content)
    template.metaResponse = remote as unknown as Record<string, unknown>
    return this.templateRepository.save(template)
  }

  private async findOwnedTemplate(templateId: number, institutionId: number) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, institutionId, provider: WhatsAppProvider.META_CLOUD },
    })
    if (!template?.metaTemplateId) {
      throw new NotFoundException('Meta template not found for this institution.')
    }
    return template
  }

  private async getContext(institutionId: number) {
    const connection = await this.connectionRepository.findByInstitutionId(institutionId)
    if (
      connection?.provider !== WhatsAppProvider.META_CLOUD ||
      connection.status !== WhatsAppProviderConnectionStatus.CONNECTED ||
      !connection.wabaId
    ) {
      throw new NotFoundException('Connected Meta Cloud integration with a WABA is required.')
    }
    const credential = await this.credentialService.getMeta(institutionId)
    if (!credential) {
      throw new NotFoundException('Meta credentials are missing for this institution.')
    }
    return { wabaId: connection.wabaId, accessToken: credential.accessToken }
  }

  private mapStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return WhatsappTemplateStatus.APPROVED
      case 'PENDING':
      case 'IN_APPEAL':
        return WhatsappTemplateStatus.PENDING
      case 'REJECTED':
      case 'PAUSED':
      case 'DISABLED':
        return WhatsappTemplateStatus.REJECTED
      default:
        return status.toLowerCase()
    }
  }

  private extractVariables(content: string): Record<string, string> {
    const variables: Record<string, string> = {}
    for (const match of content.matchAll(/\{\{([^{}]+)\}\}/g)) {
      const key = match[1]?.trim()
      if (key) variables[key] = ''
    }
    return variables
  }
}
