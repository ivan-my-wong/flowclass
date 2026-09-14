import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import axios from 'axios'

import { UpdateMetaWhatsAppProfileDto } from '@/application/admin/meta/dto/update-meta-whatsapp-profile.dto'
import { throwMetaGraphApiError } from '@/common/utils/meta-error.parser'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionRepository,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'

import { WhatsAppProviderCredentialService } from './whatsapp-provider-credential.service'

@Injectable()
export class MetaWhatsAppProfileService {
  constructor(
    private readonly whatsappProviderConnectionRepository: WhatsAppProviderConnectionRepository,
    private readonly whatsappProviderCredentialService: WhatsAppProviderCredentialService
  ) {}

  private get graphApiBase(): string {
    return 'https://graph.facebook.com/v21.0'
  }

  private async getCredentials(
    institutionId: number
  ): Promise<{ phoneNumberId: string; accessToken: string }> {
    const [connection, credential] = await Promise.all([
      this.whatsappProviderConnectionRepository.findByInstitutionId(institutionId),
      this.whatsappProviderCredentialService.getMeta(institutionId),
    ])
    const isConnectedMeta =
      connection?.provider === WhatsAppProvider.META_CLOUD &&
      connection.status === WhatsAppProviderConnectionStatus.CONNECTED
    const phoneNumberId = isConnectedMeta ? connection.externalPhoneNumberId : null
    const accessToken = credential?.accessToken
    if (!phoneNumberId || !accessToken) {
      throw new NotFoundException(
        'Meta WhatsApp integration is not fully configured for this institution. Please complete the Meta embedded signup first.'
      )
    }
    return { phoneNumberId, accessToken }
  }

  async getProfile(institutionId: number): Promise<Record<string, unknown>> {
    const { phoneNumberId, accessToken } = await this.getCredentials(institutionId)
    try {
      const response = await axios.get(
        `${this.graphApiBase}/${phoneNumberId}/whatsapp_business_profile`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            fields: 'about,address,description,email,websites,vertical,profile_picture_url',
          },
        }
      )
      const data = (response.data?.data?.[0] ?? {}) as Record<string, unknown>
      return {
        about: data['about'],
        address: data['address'],
        description: data['description'],
        email: data['email'],
        websites: (data['websites'] as string[]) ?? [],
        vertical: data['vertical'],
        logoUrl: data['profile_picture_url'],
      }
    } catch (error: unknown) {
      throwMetaGraphApiError(error, 'Failed to fetch WhatsApp profile')
    }
  }

  async updateProfile(
    institutionId: number,
    dto: UpdateMetaWhatsAppProfileDto
  ): Promise<Record<string, unknown>> {
    const { phoneNumberId, accessToken } = await this.getCredentials(institutionId)

    const body: Record<string, unknown> = { messaging_product: 'whatsapp' }
    if (dto.about !== undefined) body['about'] = dto.about
    if (dto.address !== undefined) body['address'] = dto.address
    if (dto.description !== undefined) body['description'] = dto.description
    if (dto.email !== undefined) body['email'] = dto.email
    if (dto.websites !== undefined) body['websites'] = dto.websites
    if (dto.vertical !== undefined) body['vertical'] = dto.vertical

    if (Object.keys(body).length === 1) {
      throw new BadRequestException('No updatable profile fields provided.')
    }

    try {
      const response = await axios.post(
        `${this.graphApiBase}/${phoneNumberId}/whatsapp_business_profile`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: unknown) {
      throwMetaGraphApiError(error, 'Failed to update WhatsApp profile')
    }
  }
}
