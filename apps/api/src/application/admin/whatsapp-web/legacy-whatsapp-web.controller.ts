import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('WhatsApp Web')
@Controller('whatsapp-legacy')
export class LegacyWhatsappWebController {
  @Get('disabled')
  async disabled() {
    return {
      ok: false,
      message: 'WhatsApp Web service has been disabled. Twilio WhatsApp is active.',
    }
  }
}
