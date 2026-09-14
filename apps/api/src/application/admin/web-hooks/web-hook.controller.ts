import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

import { WebHookService } from '@/domain/external/web-hook.service'

import { WebhookPayload } from './dto/web-hook.dto'

@Controller('web-hooks')
@ApiTags('Web Hooks')
// @UseGuards(WebHookGuard)
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  @Post()
  @ApiOperation({ summary: 'Handle web hook' })
  @ApiBody({ type: WebhookPayload })
  async handleWebHook(@Body() payload: WebhookPayload) {
    return this.webHookService.handleWebHook(payload)
  }
}
