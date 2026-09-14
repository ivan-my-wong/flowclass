import { MetaWhatsappService } from '@/domain/external/meta-whatsapp.service'

class SendWhatsappWorker {
  constructor(private readonly whatsappService: MetaWhatsappService) {}
}

export default SendWhatsappWorker
