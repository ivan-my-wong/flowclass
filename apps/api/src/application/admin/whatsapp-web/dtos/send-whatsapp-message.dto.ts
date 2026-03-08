import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class SendWhatsAppMessageDto {
  @ApiProperty({
    description: 'Phone number to send the message to (E.164 format)',
    example: '85212345678',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    // Remove any spaces, dashes, or other formatting
    const cleaned = value.replace(/\D/g, '')
    // If it starts with '+', remove it
    return cleaned.startsWith('+') ? cleaned.substring(1) : cleaned
  })
  @Matches(/^[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format without the + prefix (e.g., 85212345678)',
  })
  to: string

  @ApiProperty({
    description: 'Message content to send',
    example: 'Hello! This is a test message.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(4096, {
    message: 'Message content cannot exceed 4096 characters',
  })
  message: string
}

export class WhatsAppMessageResponseDto {
  @ApiProperty({
    description: 'Whether the message was sent successfully',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Error message if the message failed to send',
    example: 'Failed to send message: Invalid phone number',
    required: false,
  })
  error?: string

  @ApiProperty({
    description: 'Message ID if the message was sent successfully',
    example: '3EB0123456789ABC',
    required: false,
  })
  messageId?: string

  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: '2024-03-30T12:34:56.789Z',
    required: false,
  })
  timestamp?: string
}

type WhatsappResponse<T> = {
  data: T
  statusCode: number
  message: string
}

export type WhatsAppConnection = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  accountId: number
  phoneNumber: string | null
  status: 'connected' | 'disconnected' | 'connecting' | string
  sessionName: string
  accessToken: string
  lastConnectedAt: string | null
  lastDisconnectedAt: string | null
  webhookUrl: string
}

export type WhatsAppInitResponse = WhatsappResponse<{
  sessionId: string
  token: string
  message: string
  whatsAppConnection: WhatsAppConnection
}>

export type WhatsAppQrResponse = WhatsappResponse<{
  qrCode: string
  webhook: string
  message: string
}>

export type WhatsAppStatusResponse = WhatsappResponse<{
  status: 'connected' | 'disconnected' | 'connecting' | string
  sessionName: string
  accessToken: string
  lastConnectedAt: string | null
  lastDisconnectedAt: string | null
}>
