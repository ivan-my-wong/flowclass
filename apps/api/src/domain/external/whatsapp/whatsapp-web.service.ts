import { Injectable } from '@nestjs/common'

@Injectable()
export class WhatsAppWebService {
  constructor() {}
  async initializeClient(id: string) {}
  async getClient(id: string) {
    return null
  }
  async getQrCode(id: string) {
    return null
  }
  async getStatus(id: string) {
    return 'disconnected'
  }
  async getChats(id: string) {
    return []
  }
  async getMessages(id: string, chatId: string) {
    return []
  }
  async getUnreadMessages(id: string) {
    return []
  }
  async markMessageAsRead(id: string, chatId: string) {}
  async sendMessage(id: string, to: string, msg: string): Promise<any> {
    return { success: false }
  }
  async destroyClient(id: string) {}
  async getChatsStream(id: string): Promise<any> {
    return null
  }
  async getMessagesStream(id: string, chatId: string): Promise<any> {
    return null
  }
  async getUnreadMessagesStream(id: string): Promise<any> {
    return null
  }
}
