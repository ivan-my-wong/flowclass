import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Res,
  StreamableFile,
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
import { Response } from 'express'
import { Readable } from 'stream'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { RequireParam, Role } from '@/models/enums/'

import { ChatGPTService } from '../../../domain/external/openAi.service'

import {
  AddAiCreditMaxRequestDto,
  AddAiCreditMaxResponseDto,
  AskAzureOpenAiDto,
  ChatGPTRequestWithInstitutionIdDto,
  ChatGPTResponse,
  GetTokenBalanceDto,
  GetTokenBalanceResponse,
  RequestAiCreditDto,
  RequestAiCreditResponseDto,
  RequestChatGptTokenDto,
  RequestChatGptTokenResponseDto,
} from './dto/chatGPT.dto'

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
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('openai')
export class OpenAiController {
  constructor(private readonly chatgptService: ChatGPTService) {}

  @Get('chatgpt-stream')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to ask chat GPT.',
  })
  async askChatGptStream(
    @Query() receiveChatGPTRequestDto: ChatGPTRequestWithInstitutionIdDto,
    @Res() res: Response
  ): Promise<void> {
    return this.chatgptService.askChatgptStream(receiveChatGPTRequestDto, res)
  }

  @Get('getAiCreditLeft')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for institution manager to get chat gpt tokens left.',
  })
  async getAiCreditLeft(
    @Body() getTokenBalanceDto: GetTokenBalanceDto
  ): Promise<GetTokenBalanceResponse> {
    return await this.chatgptService.getAiCreditAvailable(getTokenBalanceDto)
  }

  @Post('aiCreditDeposit')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for adding max ai credit.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async aiCreditDeposit(
    @Body() addAiCreditMaxRequestDto: AddAiCreditMaxRequestDto
  ): Promise<AddAiCreditMaxResponseDto> {
    return await this.chatgptService.addInstitutionAiCreditMax(addAiCreditMaxRequestDto)
  }

  @Post('RequestAiCreditEmail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for adding max ai credit.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async requestAiCredit(
    @Body() requestAiCreditDto: RequestAiCreditDto
  ): Promise<RequestAiCreditResponseDto> {
    return await this.chatgptService.requestInstitutionAiCredit(requestAiCreditDto)
  }

  @Post('requestChatGpt')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for generating a token to ask chatGpt.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async requestChat(
    @Body() requestChatGptTokenDto: RequestChatGptTokenDto
  ): Promise<RequestChatGptTokenResponseDto> {
    return await this.chatgptService.requestChatGptToken(requestChatGptTokenDto)
  }

  @Post('ask-ai')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This API allows asking questions to Azure OpenAI.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed AI request',
    type: ChatGPTResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or AI credit limit reached',
  })
  async askAzureOpenAi(
    @Body() dto: AskAzureOpenAiDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile | ChatGPTResponse> {
    try {
      if (dto.stream === true) {
        const stream = await this.chatgptService.askAzureOpenAi(dto)

        // Set appropriate headers for streaming response
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Transfer-Encoding', 'chunked')

        // Create a properly typed stream
        const responseStream = Readable.from(
          (async function* () {
            try {
              for await (const chunk of stream as any) {
                yield JSON.stringify(chunk) + '\n'
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              yield JSON.stringify({ error: `Stream error: ${errorMessage}` }) + '\n'
            }
          })()
        )

        return new StreamableFile(responseStream)
      } else {
        // For non-streaming responses
        const response = await this.chatgptService.askAzureOpenAi(dto)
        return response as ChatGPTResponse
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      // Log the error for debugging
      console.error('Error in askAzureOpenAi:', error)

      // Throw a standardized exception
      throw new InternalServerErrorException(
        'Failed to process AI request. Please try again later.'
      )
    }
  }
}
