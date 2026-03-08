import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Response } from 'express'

import { Public } from '@/common/decorators/public.decorator'

import { ChatGPTService } from '../../../domain/external/openAi.service'

import { ChatGPTRequestDto, ComputerVisionOcrTextDto } from './dto/chatGPT.dto'

@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@ApiTags('Open AI')
@Public()
@Controller('openai-public')
export class OpenAiChatGptController {
  constructor(private readonly chatgptService: ChatGPTService) {}

  @Post('chatgpt-stream-turbo')
  @ApiOperation({
    summary: 'This api for institution manager use to ask chat GPT.',
  })
  async askChatGptStreamTurbo(
    @Query('browserId') browserId: string,
    @Body() receiveChatGPTRequestDto: ChatGPTRequestDto,
    @Res() res: Response
  ): Promise<void> {
    return this.chatgptService.askChatgptStreamTurboPublic(receiveChatGPTRequestDto, browserId, res)
  }

  @Get('ocr-text')
  @ApiOperation({
    summary: 'This api for institution manager use to ask chat GPT.',
  })
  async ocrTextController(@Query() dto: ComputerVisionOcrTextDto): Promise<Record<string, any>> {
    return this.chatgptService.ocrText(dto)
  }
}
