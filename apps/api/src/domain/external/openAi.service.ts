import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt/dist/jwt.service'
import { plainToInstance } from 'class-transformer'
import { Response } from 'express'
import fetch from 'node-fetch'
import { AzureOpenAI } from 'openai'
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources/chat'
import { pipeline, Writable } from 'stream'
import { get_encoding } from 'tiktoken'
import { FindOptionsWhere } from 'typeorm'
import { promisify } from 'util'

import { EmailService } from '@/domain/external/email.service'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { openAIErrorMessage } from '@/exceptions/error-message/open-aI'
import { AiCompletionChunk, AiRunsRecordRepository } from '@/models/ai-runs-record.entity'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'

import {
  AddAiCreditMaxRequestDto,
  AddAiCreditMaxResponseDto,
  AskAzureOpenAiDto,
  ChatGPTRequestDto,
  ChatGPTRequestWithInstitutionIdDto,
  ChatGPTResponse,
  ComputerVisionOcrTextDto,
  GetTokenBalanceDto,
  GetTokenBalanceResponse,
  OcrDataOutput,
  OcrDataResponse,
  OcrWordItem,
  RequestAiCreditDto,
  RequestAiCreditResponseDto,
  RequestChatGptTokenDto,
  RequestChatGptTokenResponseDto,
  UpdateAiCreditMaxByPlanRequestDto,
  UpdateAiCreditMaxByPlanResponseDto,
} from '../../application/admin/open-ai/dto/chatGPT.dto'

type Choice = {
  message: {
    content: string
  }
}

type OpenAiResponse = {
  choices?: Choice[]
  usage
}

@Injectable()
export class ChatGPTService {
  private chatGptTokensCache: { [key: string]: string } = {}
  constructor(
    @Inject('AZURE_OPENAI_SERVICE') private readonly azureOpenaiService: AzureOpenAI,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly aiRunsRecordRepository: AiRunsRecordRepository
  ) {}
  // process each chunk of data that is returned back from Azure OpenAI
  async askChatgptStreamTest(dto: ChatGPTRequestDto, res: Response) {
    try {
      const prompt = { type: 'text', text: dto.prompt }
      const roleContent = `You will write in ${dto.language} for the final output. ${
        dto.content ??
        'Act as a professional copywriter who is writing marketing material for the client.'
      }`

      const content = [prompt].filter((item) => item !== undefined)
      const options = {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: roleContent,
            },
            // ...(dto.previousMessages ?? []),
            {
              role: 'user',
              content,
            },
          ],
          enhancements: {
            ocr: { enabled: true },
            // grounding: { enabled: true },
          },
          dataSources: [
            {
              type: 'AzureComputerVision',
              parameters: {
                endpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT,
                key: process.env.AZURE_COMPUTER_VISION_KEY,
              },
            },
          ],
          temperature: dto.temperature,
          max_tokens: dto.maxTokens,
          stream: true,
        }),
        headers: {
          'api-key': process.env.AZURE_OPENAI_KEY,
          'Content-Type': 'application/json',
        },
      }

      const response = await fetch(
        `${process.env.AZURE_OPENAI_URL}/openai/deployments/${process.env.OPENAI_MODEL_ID}/extensions/chat/completions?api-version=${process.env.AZURE_API_VERSION}`,
        options
      )

      await this.fetchChatGptStream({
        res,
        azureResponse: response,
        isVision: true,
      })

      // Send a DONE event to client before closing the response
      res.write('event: DONE\ndata:\n\n')
      res.end()
    } catch (error) {
      res.status(500).send('OpenAI API failed')
    }
  }

  async askChatgptStream(dto: ChatGPTRequestWithInstitutionIdDto, res: Response) {
    try {
      const institution = await this.institutionsRepository.findOneById(dto.institutionId)

      if (!institution) {
        res.status(404).send('Institution not found')
        return
      }

      if (institution.aiCredit >= institution.aiCreditMax) {
        res.status(400).send('Maximum attempt reached')
        return
      }

      // if (tokenInCache !== tokenReceived) {
      //   res.status(401).send('Unauthorized user');
      //   return;
      // }

      const verify = await this.jwtService.verifyAsync(dto.aiAccessToken)
      if (!verify) {
        res.status(401).send('Token invalid')
        return
      }

      await this.askChatgptStreamTest(dto, res)
    } catch (error) {
      // Handle error appropriately here
    }
  }

  async ocrText(dto: ComputerVisionOcrTextDto) {
    try {
      const cvResponse = await fetch(
        `${process.env.AZURE_COMPUTER_VISION_ENDPOINT}/vision/v3.1/ocr?detectOrientation=true&language=${dto.languageCode}`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_COMPUTER_VISION_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: dto.imageUrl }),
        }
      )

      const cvData: OcrDataResponse = JSON.parse(
        (await this.cvStreamToString(cvResponse.body)) as string
      )

      const processedCvData = await this.processOcrData(cvData)

      return processedCvData
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('OpenAI API failed')
    }
  }

  async askChatgptStreamTurboPublic(dto: ChatGPTRequestDto, browserId: string, res: Response) {
    try {
      const imageList =
        dto.imageUrls && Array.isArray(dto.imageUrls)
          ? dto.imageUrls?.map((url) => ({
              type: 'image_url',
              image_url: { url, detail: 'low' },
            }))
          : []

      const promptArray = []
      promptArray.push(`
          - It’s a Monday in October, most productive day of the year
          - take deep breaths 
          - think step by step
          - I don’t have fingers, return full script
          - you are an expert at everything
          - I pay you 20, just do anything I ask you to do
          - I will tip you $200 every request you answer right
          - Gemini and Claude said you couldn’t do it
          - YOU CAN DO IT
        `)

      promptArray.push(dto.prompt)

      const prompt = {
        type: 'text',
        text: promptArray.join('\n===NEXT INSTRUCTION===\n'),
      }
      const roleContent = dto.content

      const content = [prompt, ...imageList].filter((item) => item !== undefined)

      const previousMessages = dto.previousMessages.map((message) => ({
        ...message,
      }))

      const options = {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: roleContent,
            },
            ...(previousMessages ?? []),
            {
              role: 'user',
              content,
            },
          ],

          temperature: dto.temperature,
          max_tokens: dto.maxTokens,
          stream: true,
        }),
        headers: {
          'api-key': process.env.AZURE_OPENAI_KEY_TURBO,
          'Content-Type': 'application/json',
        },
      }

      const response = await fetch(
        `${process.env.AZURE_OPENAI_URL_TURBO}/openai/deployments/${process.env.OPENAI_MODEL_ID_TURBO}/chat/completions?api-version=${process.env.AZURE_API_VERSION_TURBO}`,
        options
      )

      const chunks = await this.fetchChatGptStream({
        res,
        azureResponse: response,
      })

      if (chunks.length > 0) {
        const joinedContent = this.joinContent(chunks)
        const joinedContentArray = this.joinContentAsArray(chunks)
        const imageTokens = imageList && imageList.length > 0 ? 85 : 0

        const estimatedToken =
          this.calculateTokenUsage(dto.prompt + roleContent) +
          this.calculateTokenUsage(joinedContentArray) +
          imageTokens

        await this.aiRunsRecordRepository.save({
          isLogin: false,
          language: dto.language,
          model: process.env.OPENAI_MODEL_ID_TURBO,
          prompt: dto.prompt,
          result: joinedContent,
          tokenUsage: estimatedToken,
          userBrowserId: browserId,
          openAiRequestId: chunks[0].id,
        })
      }

      // Send a DONE event to client before closing the response
      res.write('event: DONE\ndata:\n\n')
      res.end()
    } catch (error) {
      res.status(500).send(error)

      res.end()
    }
  }

  async fetchChatGptStream({
    res,
    azureResponse,
    institution,
    isVision = false,
  }: {
    res: Response
    azureResponse
    institution?: Institution
    isVision?: boolean
  }) {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Cache-Control', 'no-cache')
    const streamPipeline = promisify(pipeline)
    let chunks: string[] = []
    const originalChunks: string[] = []
    await streamPipeline(
      azureResponse.body,
      new Writable({
        write(tmpChunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
          // Buffer the chunk
          try {
            chunks.push(tmpChunk.toString())
            originalChunks.push(tmpChunk.toString())
            let chunkStr = chunks.join('')

            let endPos

            /**
             * 在 EventSource 中，\n 和 \n\n 用於格式化服務器發送的事件。

                \n：這是一個換行符，用於分隔事件的不同部分。例如，你可以使用它來分隔事件的名稱和數據，如下所示：

                ;
                在這個例子中，event: myEvent\n 指定了事件的名稱，然後 data: This is the data for myEvent\n 提供了該事件的數據。

                \n\n：這是兩個換行符，用於表示一個事件的結束。當服務器發送 \n\n，客戶端知道該事件的所有數據都已經接收完畢，並且可以開始處理該事件。例如：

                ;
                在這個例子中，event: myEvent\n 指定了事件的名稱，data: This is the data for myEvent\n 提供了該事件的數據，然後 \n\n 表示該事件已經結束。

                在你提供的程式碼中，\n 和 \n\n 被用來格式化發送到 EventSource 的錯誤事件。
             */

            if (!chunkStr.includes('\n\n')) {
              const errorObject = JSON.parse(chunkStr.trim())
              const error = errorObject.error

              if (error && error.code && !isNaN(error.code)) {
                res.write('event: ERROR\n')
                res.write(`data: ${JSON.stringify(error)}\n\n`)
              }
            }

            while ((endPos = chunkStr.indexOf('\n\n')) >= 0) {
              // Extract one chunk from the buffer
              let jsonStr = chunkStr.substring(0, endPos)
              chunkStr = chunkStr.substring(endPos + 2)

              if (!jsonStr.startsWith('data: ')) {
                continue
              }

              if (jsonStr.trim() === 'data: [DONE]') {
                continue
              }

              jsonStr = jsonStr.substring('data: '.length)
              // Parse and process the JSON
              const chunkJson = JSON.parse(jsonStr)

              // This is for a previous version of the API
              // const textResult = chunkJson.choices[0]?.delta?.content;
              let textResult

              if (isVision) {
                if (chunkJson.choices.length > 0) {
                  if (chunkJson.choices[0].messages && chunkJson.choices[0].messages.length > 0) {
                    textResult = chunkJson.choices[0].messages[0]?.delta.content
                  }
                }
              } else {
                textResult = chunkJson.choices[0]?.delta?.content
              }

              if (textResult !== undefined) {
                if (institution !== undefined) {
                  const attemptLeft = institution.aiCreditMax - institution.aiCredit - 1
                  const data: ChatGPTResponse = {
                    text: textResult ?? '',
                    attemptLeft,
                  }
                  res.write(`data: ${JSON.stringify(data)}\n\n`)
                } else {
                  const data = {
                    text: textResult ?? '',
                  }

                  res.write(`data: ${JSON.stringify(data)}\n\n`)
                }
              }
            }

            // Store the remaining data back into chunks
            chunks = [chunkStr]

            callback()
          } catch (error) {
            callback(error)
          }
        },
        // Handle stream errors
        final(callback: (error?: Error | null) => void) {
          if (!res.headersSent) {
            throw new HttpException('Response headers not sent', HttpStatus.INTERNAL_SERVER_ERROR)
          }

          callback()
        },
      })
    )

    return this.reconstructResponse(originalChunks)
  }

  async getAiCreditAvailable(
    getTokenBalanceDto: GetTokenBalanceDto
  ): Promise<GetTokenBalanceResponse> {
    const institution = await this.institutionsRepository.findOneById(
      getTokenBalanceDto.institutionId
    )
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }
    const tokensLeft = institution.aiCreditMax - institution.aiCredit
    const getTokenBalanceResponse: GetTokenBalanceResponse = {
      aiCreditLefts: tokensLeft,
    }
    return getTokenBalanceResponse
  }

  async askChatgptTest({
    // ! For testing only
    prompt,
    temperature,
    maxTokens,
    institutionId,
  }: ChatGPTRequestWithInstitutionIdDto): Promise<ChatGPTResponse> {
    //Check Institution tokens left
    const institution = await this.institutionsRepository.findOneById(institutionId)
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    //Validate the tokens balance
    if (institution.aiCredit >= institution.aiCreditMax) {
      throw new BadRequestException(openAIErrorMessage.MAXIMUM_ATTEMPT_REACHED)
    }

    //Call OpenAI API
    let resData: OpenAiResponse = null
    try {
      const res = await this.httpService.axiosRef.post(
        `${process.env.AZURE_OPENAI_URL}/openai/deployments/${process.env.OPENAI_MODEL_ID}/completions?api-version=${process.env.AZURE_API_VERSION}`,
        {
          prompt,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'api-key': process.env.AZURE_OPENAI_KEY,
          },
        }
      )
      resData = res.data
      //Update database - institution.ai_credit
      await this.updateInstitutionAiCredit(institutionId, 1)
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.CHAT_GPT_FAILED)
    }

    const chatgptResponse: ChatGPTResponse = {
      text: resData.choices[0].message.content,
      attemptLeft: institution.aiCreditMax - institution.aiCredit - 1,
    }

    return chatgptResponse
  }

  private async updateInstitutionAiCredit(institutionId: number, aiCreditUsage: number) {
    try {
      const whereIncrementObject: FindOptionsWhere<Institution> = {
        id: institutionId,
      }
      await this.institutionsRepository.increment(whereIncrementObject, 'aiCredit', aiCreditUsage)
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.UPDATE_TOKENS_FAILED)
    }
  }

  private async updateAndGetInstitutionAiCredit(institutionId: number, aiCreditUsage: number) {
    const institution = await this.institutionsRepository.findOneById(institutionId)
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }
    const whereIncrementObject: FindOptionsWhere<Institution> = {
      id: institutionId,
    }
    await this.institutionsRepository.increment(whereIncrementObject, 'aiCredit', aiCreditUsage)

    return institution.aiCreditMax - institution.aiCredit - aiCreditUsage
  }

  async addInstitutionAiCreditMax(addAiCreditMaxRequestDto: AddAiCreditMaxRequestDto) {
    try {
      const whereIncrementObject: FindOptionsWhere<Institution> = {
        id: addAiCreditMaxRequestDto.institutionId,
      }
      await this.institutionsRepository.increment(
        whereIncrementObject,
        'aiCreditMax',
        addAiCreditMaxRequestDto.aiCreditDeposit
      )

      const institution = await this.institutionsRepository.findOneById(
        addAiCreditMaxRequestDto.institutionId
      )
      return plainToInstance(AddAiCreditMaxResponseDto, institution)
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.INCREMENT_MAX_TOKENS_FAILED)
    }
  }

  async requestInstitutionAiCredit(requestAiCreditDto: RequestAiCreditDto) {
    try {
      await this.emailService.sendRequestAiCreditMaxEmail({
        institutionId: requestAiCreditDto.institutionId,
        aiCreditDeposit: requestAiCreditDto.aiCreditDeposit,
      })
      return plainToInstance(RequestAiCreditResponseDto, requestAiCreditDto)
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.REQUEST_EMAIL_FAILED)
    }
  }

  async updateInstitutionAiCreditMaxByPlan(
    updateAiCreditMaxByPlanRequestDto: UpdateAiCreditMaxByPlanRequestDto
  ) {
    const { institutionId, planCredit } = updateAiCreditMaxByPlanRequestDto
    try {
      const institution = await this.institutionsRepository.findOneById(institutionId)
      const newAiCreditMax = institution.aiCredit + planCredit
      const updatedInstitution = await this.institutionsRepository.update(
        { id: institutionId },
        { aiCreditMax: newAiCreditMax }
      )

      return plainToInstance(UpdateAiCreditMaxByPlanResponseDto, updatedInstitution)
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.INCREMENT_MAX_TOKENS_FAILED)
    }
  }

  async requestChatGptToken(
    requestChatGptTokenDto: RequestChatGptTokenDto
  ): Promise<RequestChatGptTokenResponseDto> {
    try {
      const tokenPayload = {
        institutionId: requestChatGptTokenDto.institutionId,
      }
      const token = await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '1m',
      })

      this.chatGptTokensCache[requestChatGptTokenDto.institutionId] = token

      return plainToInstance(RequestChatGptTokenResponseDto, { token })
    } catch (error) {
      throw new BadRequestException(openAIErrorMessage.REQUEST_AI_TOKEN_FAILED)
    }
  }

  joinContent(chunks: AiCompletionChunk[], isVision = false): string {
    return chunks.reduce((acc, chunk) => {
      // const content = chunk.choices[0]?.delta.content || '';
      let content

      if (isVision) {
        if (chunk.choices.length > 0) {
          if (chunk.choices[0].messages && chunk.choices[0].messages.length > 0) {
            content = chunk.choices[0].messages[0]?.delta.content
          }
        }
      } else {
        content = chunk.choices[0]?.delta?.content
      }

      if (content && content !== '') {
        return acc + content
      }
      return acc
    }, '')
  }

  joinContentAsArray(chunks: AiCompletionChunk[], isVision = false): string[] {
    return chunks.reduce((acc, chunk) => {
      let content

      if (isVision) {
        if (chunk.choices.length > 0) {
          if (chunk.choices[0].messages && chunk.choices[0].messages.length > 0) {
            content = chunk.choices[0].messages[0]?.delta.content
          }
        }
      } else {
        content = chunk.choices[0]?.delta?.content
      }

      if (content && content !== '') {
        return [...acc, content]
      }
      return acc
    }, [])
  }

  calculateTokenUsage(text: string | string[]): number {
    // cl100k_base is default for gpt series
    const encoding = get_encoding('cl100k_base')
    let tokens = 0
    if (typeof text === 'string') {
      tokens = encoding.encode(text).length
    } else if (Array.isArray(text)) {
      tokens = text.reduce((acc, current) => {
        return acc + encoding.encode(current).length
      }, 0)
    }
    return tokens
  }

  reconstructResponse(input: string[]): AiCompletionChunk[] {
    const lines = input
      ?.join('')
      ?.split('\n')
      .filter((line) => line !== '' && line.trim() !== 'data: [DONE]')
    const chunks: AiCompletionChunk[] = []

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('data: {"choices":')) {
        try {
          const chunk = JSON.parse(lines[i].slice('data: '.length))
          chunks.push(chunk)
        } catch (e) {
          // no need handle
        }
      }
    }

    return chunks
  }

  cvStreamToString = async (stream) =>
    new Promise((resolve, reject) => {
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })

  processOcrData(ocrData: OcrDataResponse): OcrDataOutput {
    const { language, textAngle, orientation, regions } = ocrData

    const words: OcrWordItem[] = []

    if (regions) {
      for (const region of regions) {
        if (region && region.lines) {
          const currentLine = []
          for (const line of region.lines) {
            if (line && line.words) {
              currentLine.push(line.words.map((word) => word.text).join(' '))
            }
          }
          words.push({
            boundingBox: region.boundingBox,
            text: currentLine.join('\n'),
          })
        }
      }
    }

    return {
      language,
      textAngle,
      orientation,
      regions: words,
    }
  }

  async checkInstitutionAiCredit(institutionId: number) {
    const institution = await this.institutionsRepository.findOneById(institutionId)
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    if (institution.aiCredit >= institution.aiCreditMax) {
      throw new BadRequestException(openAIErrorMessage.MAXIMUM_ATTEMPT_REACHED)
    }
  }

  // Azure OpenAI
  async askAzureOpenAi(dto: AskAzureOpenAiDto) {
    try {
      await this.checkInstitutionAiCredit(dto.institutionId)

      // Get model from DTO or fallback to environment variable or default
      const model = process.env.OPENAI_MODEL_ID || 'o1-mini'
      const language = dto.language || 'English'

      // Create a system message for better context control
      const systemMessage = {
        role: 'system',
        content: `You are an educational content creator. Provide clear and engaging responses in ${language}. 
                  ${dto.markDown ? 'Use markdown formatting.' : 'Do not use markdown formatting.'}`,
      }

      // Prepare messages array with proper structure
      let messages = [
        systemMessage,
        ...(dto.messages || []),
        {
          role: 'user',
          content: dto.userPrompt,
        },
      ]

      // Handle model-specific message formatting
      if (model === 'o1-mini') {
        // Convert system message to user message for models that don't support system role
        messages = messages.map((msg) => {
          if (msg.role === 'system') {
            return { role: 'user', content: msg.content }
          }
          return msg
        })
      }

      // Configure request options with type safety
      const options: ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsStreaming =
        {
          model,
          messages: messages as ChatCompletionMessageParam[],
          stream: !!dto.stream,
        }

      // Configure model-specific parameters
      if (model === 'o1-mini') {
        options.max_completion_tokens = dto.maxTokens || 1000
      } else {
        options.temperature = dto.temperature ?? 0.7
        options.max_tokens = dto.maxTokens || 1000
      }

      // Execute request with proper error handling
      if (dto.stream) {
        const response = await this.azureOpenaiService.chat.completions.create(options)
        this.updateInstitutionAiCredit(dto.institutionId, 1).catch(console.error)
        return response
      } else {
        const response = (await this.azureOpenaiService.chat.completions.create(
          options
        )) as ChatCompletion
        const attemptLeft = await this.updateAndGetInstitutionAiCredit(dto.institutionId, 1)
        return {
          text: response.choices[0].message.content,
          attemptLeft,
        }
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Azure OpenAI API error:', error)

      // Rethrow with more context for better error handling upstream
      if (error.response?.status === 429) {
        throw new BadRequestException(openAIErrorMessage.RATE_LIMIT_EXCEEDED)
      } else if (error.response?.status === 400) {
        throw new BadRequestException(openAIErrorMessage.INVALID_REQUEST)
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BadRequestException(openAIErrorMessage.CONNECTION_TIMEOUT)
      } else {
        throw error
      }
    }
  }
}
