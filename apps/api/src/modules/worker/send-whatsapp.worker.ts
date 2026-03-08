import { WhatsappService } from '@/domain/external/whatsapp.service'

class SendWhatsappWorker {
  constructor(private readonly whatsappService: WhatsappService) {}
}

export default SendWhatsappWorker
