import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

import { NotificationStatus } from '@/models/notification-record.entity'
import { WhatsAppSession, WhatsappSessionRepository } from '@/models/whatsapp-session.entity'
import { BaseService } from '@/modules/base/base.service'

import { NotificationRecordService, SaveNotificationLogParams } from './notification-log.service'

@Injectable()
export class WhatsappWebService extends BaseService<WhatsAppSession> {
  constructor(
    private readonly whatsappSessionRepository: WhatsappSessionRepository,
    private readonly notificationRecordService: NotificationRecordService
  ) {
    super(whatsappSessionRepository)
  }

  async createSession(institutionId: number): Promise<WhatsAppSession> {
    const session = await this.whatsappSessionRepository.create({
      institutionId,
      sessionId: uuidv4(),
      sessionData: {},
    })
    await this.whatsappSessionRepository.save(session)
    return session
  }

  async getSession(institutionId: number): Promise<WhatsAppSession | null> {
    const session = await this.whatsappSessionRepository.findOne({
      where: { institutionId },
    })

    if (!session) {
      return null
    }
    return session
  }

  async getOrCreateSession(institutionId: number): Promise<WhatsAppSession> {
    let session = await this.getSession(institutionId)

    const checkIfMoreThanOneSession = await this.whatsappSessionRepository.findAll({
      where: { institutionId },
    })

    if (checkIfMoreThanOneSession.length > 1) {
      await this.whatsappSessionRepository.delete(
        checkIfMoreThanOneSession
          .filter((thisSession) => thisSession.id !== session.id)
          .map((thisSession) => thisSession.id)
      )
    }

    if (!session) {
      session = await this.createSession(institutionId)
    }

    return session
  }

  async getQrCode(institutionId: number) {
    await this.getOrCreateSession(institutionId)
    return {
      data: {
        qrCode: '',
        message: 'WhatsApp web integration is disabled in OSS mode',
      },
      statusCode: 503,
      message: 'WHATSAPP_WEB_DISABLED',
    }
  }

  async initializeSession(institutionId: number) {
    return this.getOrCreateSession(institutionId)
  }

  async getStatus(institutionId: number) {
    await this.getOrCreateSession(institutionId)
    return {
      data: {
        status: 'disconnected',
        qrCode: '',
        message: 'WhatsApp web integration is disabled in OSS mode',
      },
      statusCode: 503,
      message: 'WHATSAPP_WEB_DISABLED',
    }
  }

  async sendMessage(institutionId: number, phone: string, message: string) {
    await this.getOrCreateSession(institutionId)
    return {
      data: {
        success: false,
        error: 'WhatsApp web integration is disabled in OSS mode',
      },
      status: 503,
      message: 'WHATSAPP_WEB_DISABLED',
      request: {
        institutionId,
        phone,
        message,
      },
    }
  }

  async sendWhatsappMessage(
    dto: {
      content: string
      institutionId: number
      phone: string
    },
    logData: Omit<SaveNotificationLogParams, 'messageContent' | 'notificationStatus'>
  ) {
    const { content, institutionId, phone } = dto
    try {
      const response = await this.sendMessage(institutionId, phone, content)

      if (response && response.status) {
        const status = response.status

        await this.notificationRecordService.saveNotificationLog({
          messageContent: content,
          notificationStatus:
            status >= 200 && status < 300 ? NotificationStatus.SENT : NotificationStatus.FAILED,
          ...logData,
        })
      }
    } catch (error) {
      await this.notificationRecordService.saveNotificationLog({
        messageContent: content,
        notificationStatus: NotificationStatus.FAILED,
        ...logData,
      })
    }
  }

  async removeSession(institutionId: number): Promise<void> {
    const sessions = await this.whatsappSessionRepository.findAll({
      where: { institutionId },
    })

    if (!sessions) {
      return
    }

    await this.whatsappSessionRepository.delete(sessions.map((session) => session.id))
  }
}
