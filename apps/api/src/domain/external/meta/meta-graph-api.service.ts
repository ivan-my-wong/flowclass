import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import axios from 'axios'

import { throwMetaGraphApiError } from '@/common/utils/meta-error.parser'

interface IMetaTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
}

export interface IMetaPhoneNumber {
  id: string
  display_phone_number?: string
  verified_name?: string
  quality_rating?: string
  status?: string
}

interface IMetaSendMessageResponse {
  messaging_product?: string
  contacts?: Array<{ input?: string; wa_id?: string }>
  messages?: Array<{ id?: string }>
}

interface IMetaMediaMetadata {
  url?: string
  mime_type?: string
  sha256?: string
  file_size?: number
  id?: string
}

interface IMetaWaba {
  id: string
  name?: string
  currency?: string
  primary_funding_id?: string
}

export interface IMetaMessageTemplate {
  id: string
  name: string
  status: string
  category: string
  language: string
  components?: Array<{
    type?: string
    text?: string
    format?: string
    example?: Record<string, unknown>
    buttons?: Array<Record<string, unknown>>
  }>
  quality_score?: Record<string, unknown>
}

export interface IMetaTemplateMutationInput {
  category?: string
  components: IMetaMessageTemplate['components']
}

@Injectable()
export class MetaGraphApiService {
  private get graphApiBase(): string {
    return 'https://graph.facebook.com/v21.0'
  }

  private getAppCredentials(): { appId: string; appSecret: string } {
    const appId = process.env.META_APP_ID || '1169305084905353' // ezchat default / configured
    const appSecret = process.env.META_APP_SECRET
    if (!appId) {
      throw new InternalServerErrorException('Meta app credentials are not configured.')
    }
    return { appId, appSecret: appSecret || '' }
  }

  async exchangeAuthorizationCode(
    code: string,
    redirectUri?: string
  ): Promise<{
    accessToken: string
    expiresAt?: Date
  }> {
    const { appId, appSecret } = this.getAppCredentials()
    const targetRedirectUri = redirectUri ?? ''

    try {
      const response = await axios.get<IMetaTokenResponse>(
        `${this.graphApiBase}/oauth/access_token`,
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code,
            redirect_uri: targetRedirectUri,
          },
        }
      )
      if (!response.data.access_token) {
        throw new BadGatewayException('Meta did not return an access token.')
      }
      return {
        accessToken: response.data.access_token,
        expiresAt: response.data.expires_in
          ? new Date(Date.now() + response.data.expires_in * 1000)
          : undefined,
      }
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to exchange the Meta authorization code.')
    }
  }

  async getAccessibleWaba(
    businessId: string | undefined,
    wabaId: string,
    accessToken: string
  ): Promise<IMetaWaba> {
    try {
      const direct = await axios.get<IMetaWaba>(`${this.graphApiBase}/${wabaId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { fields: 'id,name,currency,primary_funding_id' },
      })
      if (!direct.data?.id || direct.data.id !== wabaId) {
        throw new BadRequestException('Meta did not grant access to the selected WABA.')
      }

      if (businessId) {
        const edges = ['client_whatsapp_business_accounts', 'owned_whatsapp_business_accounts']
        const memberships = await Promise.allSettled(
          edges.map((edge) =>
            axios.get<{ data?: IMetaWaba[] }>(`${this.graphApiBase}/${businessId}/${edge}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { fields: 'id', limit: 100 },
            })
          )
        )
        const isVisible = memberships.some(
          (result) =>
            result.status === 'fulfilled' &&
            result.value.data.data?.some((item) => item.id === wabaId)
        )
        if (!isVisible) {
          throw new BadRequestException(
            'The selected WABA is not shared with or owned by this Meta Business.'
          )
        }
      }
      return direct.data
    } catch (error) {
      throwMetaGraphApiError(error, 'Unable to validate access to the selected WABA.')
    }
  }

  async attachCreditLine(
    creditLineId: string,
    wabaId: string,
    currency: string,
    systemUserAccessToken: string
  ): Promise<void> {
    try {
      await axios.post(
        `${this.graphApiBase}/${creditLineId}/whatsapp_credit_sharing_and_attach`,
        {},
        {
          headers: { Authorization: `Bearer ${systemUserAccessToken}` },
          params: { waba_id: wabaId, waba_currency: currency },
        }
      )
    } catch (error) {
      throwMetaGraphApiError(error, 'Unable to attach billing account to this WABA.')
    }
  }

  async getPhoneNumber(
    wabaId: string,
    phoneNumberId: string,
    accessToken: string
  ): Promise<IMetaPhoneNumber> {
    try {
      try {
        const directResponse = await axios.get<IMetaPhoneNumber>(
          `${this.graphApiBase}/${phoneNumberId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              fields: 'id,display_phone_number,verified_name,quality_rating,status',
            },
          }
        )
        if (directResponse.data?.id) {
          return directResponse.data
        }
      } catch {
        // Fallback to querying WABA phone numbers list
      }

      const response = await axios.get<{ data?: IMetaPhoneNumber[] }>(
        `${this.graphApiBase}/${wabaId}/phone_numbers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            fields: 'id,display_phone_number,verified_name,quality_rating,status',
            limit: 25,
          },
        }
      )
      const phoneNumber = response.data.data?.find((item) => item.id === phoneNumberId)
      if (!phoneNumber) {
        throw new BadRequestException('The selected phone number does not belong to this WABA.')
      }
      return phoneNumber
    } catch (error) {
      throwMetaGraphApiError(error, 'Unable to validate the selected WhatsApp phone number.')
    }
  }

  async getPhoneNumbers(wabaId: string, accessToken: string): Promise<IMetaPhoneNumber[]> {
    try {
      const response = await axios.get<{ data?: IMetaPhoneNumber[] }>(
        `${this.graphApiBase}/${wabaId}/phone_numbers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            fields: 'id,display_phone_number,verified_name,quality_rating,status',
            limit: 25,
          },
        }
      )
      return response.data.data ?? []
    } catch (error) {
      throwMetaGraphApiError(error, 'Unable to fetch WhatsApp phone numbers for this WABA.')
    }
  }

  async subscribeWaba(wabaId: string, accessToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.graphApiBase}/${wabaId}/subscribed_apps`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to subscribe the application to the WABA.')
    }
  }

  async unsubscribeWaba(wabaId: string, accessToken: string): Promise<void> {
    try {
      await axios.delete(`${this.graphApiBase}/${wabaId}/subscribed_apps`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to unsubscribe the application from the WABA.')
    }
  }

  async listMessageTemplates(wabaId: string, accessToken: string): Promise<IMetaMessageTemplate[]> {
    try {
      const templates: IMetaMessageTemplate[] = []
      let after: string | undefined
      for (let page = 0; page < 20; page += 1) {
        const response = await axios.get<{
          data?: IMetaMessageTemplate[]
          paging?: { cursors?: { after?: string }; next?: string }
        }>(`${this.graphApiBase}/${wabaId}/message_templates`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            fields: 'id,name,status,category,language,components,quality_score',
            limit: 100,
            ...(after ? { after } : {}),
          },
        })
        templates.push(...(response.data.data ?? []))
        const nextAfter = response.data.paging?.cursors?.after
        if (!response.data.paging?.next || !nextAfter || nextAfter === after) break
        after = nextAfter
      }
      return templates
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to list Meta WhatsApp message templates.')
    }
  }

  async getMessageTemplate(
    templateId: string,
    accessToken: string
  ): Promise<IMetaMessageTemplate | null> {
    try {
      const response = await axios.get<IMetaMessageTemplate>(`${this.graphApiBase}/${templateId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          fields: 'id,name,status,category,language,components,quality_score',
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throwMetaGraphApiError(error, 'Failed to fetch Meta WhatsApp message template.')
    }
  }

  async createMessageTemplate(
    wabaId: string,
    accessToken: string,
    input: {
      name: string
      language: string
      category: string
      components: IMetaMessageTemplate['components']
    }
  ): Promise<{ id: string; status?: string; category?: string }> {
    try {
      const response = await axios.post<{ id?: string; status?: string; category?: string }>(
        `${this.graphApiBase}/${wabaId}/message_templates`,
        input,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!response.data.id) {
        throw new BadGatewayException('Meta did not return a template ID.')
      }
      return { ...response.data, id: response.data.id }
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to create the Meta WhatsApp message template.')
    }
  }

  async updateMessageTemplate(
    templateId: string,
    accessToken: string,
    input: IMetaTemplateMutationInput
  ): Promise<void> {
    try {
      await axios.post(`${this.graphApiBase}/${templateId}`, input, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to update the Meta WhatsApp message template.')
    }
  }

  async deleteMessageTemplate(
    wabaId: string,
    accessToken: string,
    input: { templateId: string; name: string }
  ): Promise<void> {
    try {
      await axios.delete(`${this.graphApiBase}/${wabaId}/message_templates`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { hsm_id: input.templateId, name: input.name },
      })
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to delete the Meta WhatsApp message template.')
    }
  }

  async migrateMessageTemplates(
    wabaId: string,
    accessToken: string,
    sourceWabaId: string
  ): Promise<void> {
    try {
      await axios.post(
        `${this.graphApiBase}/${wabaId}/migrate_message_templates`,
        { source_waba_id: sourceWabaId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to migrate Meta WhatsApp message templates.')
    }
  }

  async registerPhoneNumber(
    phoneNumberId: string,
    pin: string,
    accessToken: string
  ): Promise<void> {
    try {
      await axios.post(
        `${this.graphApiBase}/${phoneNumberId}/register`,
        { messaging_product: 'whatsapp', pin },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to register the WhatsApp phone number.')
    }
  }

  async sendTextMessage(input: {
    phoneNumberId: string
    recipient: string
    message: string
    accessToken: string
    replyMessageId?: string
  }): Promise<{ messageId: string; response: IMetaSendMessageResponse }> {
    return this.sendMessage(
      input.phoneNumberId,
      input.accessToken,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: input.recipient,
        type: 'text',
        text: { preview_url: false, body: input.message },
        ...(input.replyMessageId ? { context: { message_id: input.replyMessageId } } : {}),
      },
      'Failed to send the Meta WhatsApp text message.'
    )
  }

  async sendMediaMessage(input: {
    phoneNumberId: string
    recipient: string
    type: 'audio' | 'document' | 'image' | 'sticker' | 'video'
    url: string
    accessToken: string
    caption?: string
    filename?: string
    replyMessageId?: string
  }): Promise<{ messageId: string; response: IMetaSendMessageResponse }> {
    const media = {
      link: input.url,
      ...(input.caption && ['document', 'image', 'video'].includes(input.type)
        ? { caption: input.caption }
        : {}),
      ...(input.filename && input.type === 'document' ? { filename: input.filename } : {}),
    }
    return this.sendMessage(
      input.phoneNumberId,
      input.accessToken,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: input.recipient,
        type: input.type,
        [input.type]: media,
        ...(input.replyMessageId ? { context: { message_id: input.replyMessageId } } : {}),
      },
      'Failed to send the Meta WhatsApp media message.'
    )
  }

  async sendTemplateMessage(input: {
    phoneNumberId: string
    recipient: string
    templateName: string
    language?: string
    languageCode?: string
    accessToken: string
    variables?: Record<string, string>
    components?: any[]
  }): Promise<{ messageId: string; response: IMetaSendMessageResponse }> {
    const langCode = input.languageCode || input.language || 'en'
    let components = input.components
    if (!components && input.variables) {
      const parameters = Object.entries(input.variables)
        .sort(([left], [right]) => Number(left) - Number(right))
        .map(([, value]) => ({ type: 'text', text: value }))
      if (parameters.length) {
        components = [{ type: 'body', parameters }]
      }
    }
    return this.sendMessage(
      input.phoneNumberId,
      input.accessToken,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: input.recipient,
        type: 'template',
        template: {
          name: input.templateName,
          language: { code: langCode },
          ...(components && components.length ? { components } : {}),
        },
      },
      'Failed to send the Meta WhatsApp template message.'
    )
  }

  async sendInteractiveMessage(input: {
    phoneNumberId: string
    recipient: string
    accessToken: string
    interactive: Record<string, unknown>
    replyMessageId?: string
  }): Promise<{ messageId: string; response: IMetaSendMessageResponse }> {
    return this.sendMessage(
      input.phoneNumberId,
      input.accessToken,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: input.recipient,
        type: 'interactive',
        interactive: input.interactive,
        ...(input.replyMessageId ? { context: { message_id: input.replyMessageId } } : {}),
      },
      'Failed to send the Meta WhatsApp interactive message.'
    )
  }

  async downloadMedia(
    mediaId: string,
    accessToken: string
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    try {
      const metadataResponse = await axios.get<IMetaMediaMetadata>(
        `${this.graphApiBase}/${mediaId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const metadata = metadataResponse.data
      if (!metadata.url) {
        throw new BadGatewayException('Meta did not return a media download URL.')
      }
      const configuredMaxBytes = Number(process.env.META_MEDIA_MAX_BYTES)
      const maxBytes =
        Number.isFinite(configuredMaxBytes) && configuredMaxBytes > 0
          ? configuredMaxBytes
          : 20 * 1024 * 1024
      if (metadata.file_size && metadata.file_size > maxBytes) {
        throw new BadRequestException(`Meta media exceeds the ${maxBytes}-byte download limit.`)
      }
      const mediaResponse = await axios.get<ArrayBuffer>(metadata.url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'arraybuffer',
        maxContentLength: maxBytes,
        maxBodyLength: maxBytes,
      })
      const buffer = Buffer.from(mediaResponse.data)
      if (buffer.byteLength > maxBytes) {
        throw new BadRequestException(`Meta media exceeds the ${maxBytes}-byte download limit.`)
      }
      return {
        buffer,
        mimeType:
          metadata.mime_type ||
          String(mediaResponse.headers['content-type'] || 'application/octet-stream'),
      }
    } catch (error) {
      throwMetaGraphApiError(error, 'Failed to download the Meta WhatsApp media.')
    }
  }

  private async sendMessage(
    phoneNumberId: string,
    accessToken: string,
    payload: Record<string, unknown>,
    fallbackMessage: string
  ): Promise<{ messageId: string; response: IMetaSendMessageResponse }> {
    try {
      const response = await axios.post<IMetaSendMessageResponse>(
        `${this.graphApiBase}/${phoneNumberId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const messageId = response.data.messages?.[0]?.id
      if (!messageId) {
        throw new BadGatewayException('Meta did not return a message ID.')
      }
      return { messageId, response: response.data }
    } catch (error) {
      throwMetaGraphApiError(error, fallbackMessage)
    }
  }

  async triggerCoexistenceSync(
    phoneNumberId: string,
    syncType: 'smb_app_state_sync' | 'history',
    accessToken: string
  ): Promise<{ requestId: string }> {
    try {
      const response = await axios.post<{ request_id?: string }>(
        `${this.graphApiBase}/${phoneNumberId}/smb_app_data`,
        {
          messaging_product: 'whatsapp',
          sync_type: syncType,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!response.data.request_id) {
        throw new BadGatewayException('Meta did not return a request ID.')
      }
      return { requestId: response.data.request_id }
    } catch (error) {
      throwMetaGraphApiError(error, `Unable to trigger coexistence sync for ${syncType}.`)
    }
  }
}
