import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { WhatsappWebService } from '@/domain/service/whatsapp-web.service'
import { RequireParam } from '@/models/enums'

import {
  SendWhatsAppMessageDto,
  WhatsAppMessageResponseDto,
} from './dtos/send-whatsapp-message.dto'

@ApiTags('WhatsApp Web')
@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('whatsapp')
export class WhatsappWebController {
  constructor(private readonly whatsappWebService: WhatsappWebService) {}

  @ApiOperation({
    summary: 'This api for get session information',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('session')
  async generateSession(@Query('institutionId') institutionId: string) {
    try {
      const response = await this.whatsappWebService.getOrCreateSession(parseInt(institutionId))
      return response
    } catch (error) {
      throw new Error('Failed to initialize session')
    }
  }

  @ApiOperation({
    summary: 'This api for initialize session',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('session/initialize')
  async initializeSession(@Query('institutionId', ParseIntPipe) institutionId: number) {
    try {
      const response = await this.whatsappWebService.initializeSession(institutionId)
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to initialize session')
    }
  }

  @ApiOperation({
    summary: 'This api for get whatsapp status',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('status')
  async getStatus(@Query('institutionId', ParseIntPipe) institutionId: number) {
    const { data } = await this.whatsappWebService.getStatus(institutionId)
    return data
  }

  @ApiOperation({
    summary: 'Send a WhatsApp message',
    description: 'Send a message to a WhatsApp number using the WhatsApp Web API',
  })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: WhatsAppMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid phone number or message format',
    type: WhatsAppMessageResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Server error or WhatsApp service unavailable',
    type: WhatsAppMessageResponseDto,
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('send')
  async sendMessage(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() messageDto: SendWhatsAppMessageDto
  ): Promise<WhatsAppMessageResponseDto> {
    try {
      const { data } = await this.whatsappWebService.sendMessage(
        institutionId,
        messageDto.to,
        messageDto.message
      )
      return data
    } catch (error) {
      console.error('Send message error:', error)

      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
      }
    }
  }

  @ApiOperation({
    summary: 'This api for remove whatsapp session',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('session/remove')
  async removeSession(@Query('institutionId', ParseIntPipe) institutionId: number) {
    return this.whatsappWebService.removeSession(institutionId)
  }
}
