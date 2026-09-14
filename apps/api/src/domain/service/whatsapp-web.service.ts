import { Injectable } from '@nestjs/common'

import { WhatsAppSession } from '@/models/whatsapp-session.entity'

@Injectable()
export class WhatsappWebService {
  constructor() {}

  async createSession(institutionId: number): Promise<WhatsAppSession> {
    return {
      id: 0,
      institutionId,
      sessionId: 'disabled',
      sessionData: {
        message: 'disabled',
        sessionId: 'disabled',
        token: 'disabled',
        whatsAppConnection: {
          sessionName: 'disabled',
          status: 'disabled',
          phoneNumber: 'disabled',
        },
      },
      ezchatAccountId: 0,
    } as WhatsAppSession
  }

  async getSession(institutionId: number): Promise<WhatsAppSession | null> {
    // Return null to prevent any downstream actions from attempting to send messages
    return null
  }

  async getOrCreateSession(institutionId: number): Promise<WhatsAppSession> {
    return {
      id: 0,
      institutionId,
      sessionId: 'disabled',
      sessionData: {
        message: 'disabled',
        sessionId: 'disabled',
        token: 'disabled',
        whatsAppConnection: {
          sessionName: 'disabled',
          status: 'disabled',
          phoneNumber: 'disabled',
        },
      },
      ezchatAccountId: 0,
    } as WhatsAppSession
  }

  async getQrCode(institutionId: number) {
    return {
      data: {
        qrCode: '',
      },
    }
  }

  async initializeSession(institutionId: number) {
    return null
  }

  async getStatus(institutionId: number) {
    return {
      data: {
        data: {
          status: 'disconnected',
          sessionName: 'disabled',
          accessToken: 'disabled',
          lastConnectedAt: null,
          lastDisconnectedAt: null,
        },
        statusCode: 200,
        message: 'WhatsApp Web service has been disabled.',
      },
    }
  }

  async sendMessage(institutionId: number, phone: string, message: string) {
    return {
      status: 200,
      success: true,
      data: {
        success: true,
      },
    }
  }

  async sendWhatsappMessage(
    dto: {
      content: string
      institutionId: number
      phone: string
    },
    logData: any
  ) {
    // Disabled/no-op
  }

  async removeSession(institutionId: number): Promise<void> {
    return
  }
}
