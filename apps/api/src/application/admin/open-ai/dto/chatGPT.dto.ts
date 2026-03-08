import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

type AiRole = 'assistant' | 'system' | 'user' | 'function' | 'tool'

export class ChatGPTResponse {
  text: string
  attemptLeft: number
}

export type AiMessageItem = {
  text?: { type: 'text'; text: string }
  images?: {
    type: 'image_url'
    // eslint-disable-next-line camelcase
    image_url: { url: string; detail?: 'high' | 'low' | 'auto' }
  }
}

export type AiConversationItem = {
  role: AiRole
  content: AiMessageItem[]
}

export type OcrWordItem = {
  boundingBox: string
  text: string
}

export type OcrLineItem = {
  boundingBox: string
  words: OcrWordItem[]
}

export type OcrRegionItem = {
  boundingBox: string
  lines: OcrLineItem[]
}

export type OcrDataResponse = {
  language: string
  textAngle: number
  orientation: string
  regions: OcrRegionItem[]
}

export type OcrDataOutput = {
  language: string
  textAngle: number
  orientation: string
  regions: OcrWordItem[]
}

export class ChatGPTRequestDto {
  @ApiProperty({
    example: 'how are you doing?',
  })
  @IsNotEmpty()
  prompt: string

  @ApiProperty({
    example: 'English (China)',
  })
  @IsNotEmpty()
  language: string

  @ApiPropertyOptional({
    example: 'the user base',
  })
  @IsOptional()
  @IsString()
  content: string

  @ApiPropertyOptional({
    example: 'image_1_url,image_2_url,image_3_url',
  })
  @IsOptional()
  @IsArray()
  imageUrls?: string[]

  @ApiProperty({
    example: '0.6',
  })
  @IsOptional()
  @Transform(({ obj, key }) => {
    return parseFloat(obj[key])
  })
  @IsNumber()
  temperature: number

  @ApiProperty({
    example: '40',
  })
  @IsOptional()
  @Transform(({ obj, key }) => {
    return parseInt(obj[key])
  })
  @IsNumber()
  maxTokens: number

  @ApiProperty({
    example: [
      {
        role: 'user',
        content: [{ text: 'Hello, how are you?' }],
      },
    ],
  })
  @IsOptional()
  @Type(() => Array<AiConversationItem>)
  @IsArray()
  previousMessages?: AiConversationItem[]
}
export class ChatGPTRequestWithTrackingDto extends ChatGPTRequestDto {
  @ApiProperty({
    example: '2',
  })
  @IsNotEmpty()
  @IsUUID()
  browserId: string
}

export class ChatGPTRequestWithInstitutionIdDto extends ChatGPTRequestDto {
  @ApiProperty({
    example: '2',
  })
  @IsNotEmpty()
  @Transform(({ obj, key }) => {
    return parseInt(obj[key])
  })
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 'x@1231#jkldhsfds%ghO*DSAJjsa8d7I*D^I@!*&@!#JHG@*!g87g12*&#^',
  })
  @IsNotEmpty()
  @IsString()
  aiAccessToken: string
}

export class ComputerVisionOcrTextDto {
  @ApiProperty({
    example: 'en',
  })
  @IsNotEmpty()
  languageCode: string

  @ApiPropertyOptional({
    example: 'image_1_url',
  })
  @IsString()
  imageUrl: string

  @ApiProperty({
    example: '2',
  })
  @IsNotEmpty()
  @IsUUID()
  browserId: string
}
export class GetTokenBalanceDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class RequestChatGptTokenDto extends GetTokenBalanceDto {}

export class RequestChatGptTokenResponseDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  token: string
}
export class GetTokenBalanceResponse {
  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  aiCreditLefts: number
}

export class TestChatGPTRequestDto {
  @ApiProperty({
    example: 'Draft me a course description about CS50',
  })
  @IsNotEmpty()
  prompt: string

  @ApiProperty({
    example: 0.6,
  })
  @IsNumber()
  @IsOptional()
  temperature: number

  @ApiProperty({
    example: 400,
  })
  @IsOptional()
  @IsNumber()
  maxTokens: number

  @ApiProperty({
    example: 219,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class AddAiCreditMaxRequestDto {
  @ApiProperty({
    example: 219,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  aiCreditDeposit: number
}

export class AddAiCreditMaxResponseDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  id: number

  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  aiCreditMax: number
}

export class RequestAiCreditDto extends AddAiCreditMaxRequestDto {}
export class RequestAiCreditResponseDto extends AddAiCreditMaxRequestDto {}

export class UpdateAiCreditMaxByPlanRequestDto {
  @ApiProperty({
    example: 219,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  planCredit: number
}

export class UpdateAiCreditMaxByPlanResponseDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  id: number

  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  aiCreditMax: number
}

export class AskAzureOpenAiMessageDto {
  @ApiProperty({
    example: 'user',
    description: 'The role of the message',
  })
  @IsNotEmpty()
  @IsString()
  role: AiRole

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The content of the message',
  })
  @IsNotEmpty()
  @IsString()
  content: string
}

export class AskAzureOpenAiDto {
  @ApiProperty({
    example: 1,
    description: 'The institution ID',
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 'Draft me a course description about CS50',
    description: 'The main prompt from the user',
  })
  @IsNotEmpty()
  @IsString()
  userPrompt: string

  @ApiProperty({
    example: [
      {
        role: 'user',
        content: 'Previous conversation history',
      },
    ],
    description: 'Complete conversation history for context',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AskAzureOpenAiMessageDto)
  messages?: AskAzureOpenAiMessageDto[]

  @ApiPropertyOptional({
    example: 'English',
    description: 'Target language for the response',
  })
  @IsOptional()
  language?: string

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to stream the response',
  })
  @IsOptional()
  stream?: boolean

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum number of tokens to generate',
  })
  @IsOptional()
  maxTokens?: number

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to format the response as markdown',
  })
  @IsOptional()
  markDown?: boolean

  @ApiPropertyOptional({
    example: 0.7,
    description: 'Controls randomness: 0 is deterministic, 1 is very random',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number
}
