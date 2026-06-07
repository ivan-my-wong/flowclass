import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

import { SaveDivitConfigDto } from '../dto/divit-config.dto'
import { DivitService } from '../services/divit.service'

@ApiTags('Divit')
@ApiUnauthorizedResponse({ description: 'Unauthenticated request.' })
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('divit')
export class DivitAdminController {
  constructor(private readonly divitService: DivitService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get Divit config for an institution (keys masked)' })
  @ApiQuery({ name: 'institutionId', type: Number })
  getConfig(@Query('institutionId') institutionId: number) {
    return this.divitService.getConfig(Number(institutionId))
  }

  @Post('config')
  @ApiOperation({ summary: 'Save or update Divit config for an institution' })
  saveConfig(@Body() dto: SaveDivitConfigDto) {
    return this.divitService.saveConfig(dto)
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Receive Divit payment webhook events' })
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async webhook(
    @Req() req: { body: Buffer; headers: Record<string, string> },
    @Query('institutionId') institutionId: number,
  ) {
    const rawBody = req.body?.toString?.() ?? ''
    const signatureHeader = req.headers['x-divit-signature'] || ''
    return this.divitService.handleWebhook(rawBody, signatureHeader, Number(institutionId))
  }
}
