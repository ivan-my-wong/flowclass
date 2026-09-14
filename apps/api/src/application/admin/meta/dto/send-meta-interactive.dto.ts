import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class SendMetaInteractiveDto {
  @ApiProperty({ description: 'Institution ID' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ description: 'Recipient phone number in E.164 format' })
  @IsString()
  @IsNotEmpty()
  recipient: string

  @ApiProperty({ description: 'Meta interactive payload object (button, list, etc.)' })
  @IsObject()
  @IsNotEmpty()
  interactive: Record<string, unknown>

  @ApiPropertyOptional({ description: 'Optional reply message ID for context' })
  @IsString()
  @IsOptional()
  replyMessageId?: string
}
