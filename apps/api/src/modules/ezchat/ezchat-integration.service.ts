import { Inject, Injectable } from '@nestjs/common'
import { AxiosInstance, AxiosRequestConfig } from 'axios'

import { EZCHAT_CLIENT, EZCHAT_TOKEN } from '@/common/constants/provider-keys'
import { NotificationStatus } from '@/models/notification-record.entity'

export enum EzChatAccountType {
  PRODUCTION = 'production',
  STAGING = 'staging',
}

@Injectable()
export class EzchatService {
  private readonly ezchatEnv =
    process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'local'
      ? EzChatAccountType.STAGING
      : EzChatAccountType.PRODUCTION

  constructor(
    // the client is initialized in the ezchat-integration.module.ts file
    @Inject(EZCHAT_CLIENT)
    public readonly client: AxiosInstance,
    @Inject(EZCHAT_TOKEN)
    public readonly token: string
  ) {}

  get ezchatToken() {
    return this.token
  }

  private async _requestWithTimeoutHandling(config: AxiosRequestConfig) {
    const url = config.url || ''

    if (url.includes('/get-status')) {
      return {
        data: {
          status: 'disconnected',
          message: 'WhatsApp Web is disabled',
          qrCode: '',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as any
    }

    if (url.includes('/send-text')) {
      return {
        data: {
          success: false,
          message: 'WhatsApp Web is disabled',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as any
    }

    return {
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as any
  }

  async getSession(institutionId: number, sessionId: string) {
    return this._requestWithTimeoutHandling({
      method: 'GET',
      url: `/integration/initialize/${sessionId}`,
      params: { institutionId },
      timeout: 3000,
    })
  }

  async getSessionStatus(institutionId: number, sessionId: string) {
    return this._requestWithTimeoutHandling({
      method: 'GET',
      url: `/integration/${sessionId}/get-status`,
      params: { institutionId },
      timeout: 3000,
    })
  }

  getQrCode(institutionId: number, sessionId: string) {
    return this._requestWithTimeoutHandling({
      method: 'GET',
      url: `/integration/qr/${sessionId}`,
      params: { institutionId },
      timeout: 3000,
    })
  }

  async sendWhatsappMessage(
    sessionId: string,
    dto: {
      content: string
      institutionId: number
      phone: string
    },
    cb?: (isSuccess: NotificationStatus) => void | Promise<void>
  ) {
    const { content, institutionId, phone } = dto
    try {
      const response = await this.sendMessage(sessionId, content, phone, institutionId)
      const status = response.status
      // Error if send message failed through ezchat request
      cb(status >= 200 && status < 300 ? NotificationStatus.SENT : NotificationStatus.FAILED)
    } catch (error) {
      // Error if send message failed through ezchat request
      cb(NotificationStatus.FAILED)
    }
  }

  async sendMessage(
    sessionId: string,
    message: string,
    phoneNumber: string,
    institutionId: number,
    url?: string,
    caption?: string
  ) {
    return this._requestWithTimeoutHandling({
      method: 'POST',
      url: `/integration/${sessionId}/send-text`,
      params: { institutionId },
      data: { message, number: phoneNumber, url, caption },
      timeout: 3000,
    })
  }

  async createAccount(institutionId: number) {
    return this._requestWithTimeoutHandling({
      method: 'PATCH',
      url: `/integration/account`,
      params: { institutionId },
    })
  }

  removeSession(institutionId: number, sessionId: string) {
    return this._requestWithTimeoutHandling({
      method: 'GET',
      url: `/integration/${sessionId}/logout-session`,
      params: { institutionId },
      timeout: 10000,
    })
  }
}
