import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateMetaTemplateDto {
  @ApiProperty({ description: 'Institution ID' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ description: 'Template name in lowercase alphanumeric with underscores' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Template category: UTILITY, MARKETING, AUTHENTICATION' })
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({ description: 'Template language code: en, zh, etc.' })
  @IsString()
  @IsNotEmpty()
  language: string

  @ApiProperty({ description: 'Template components (HEADER, BODY, FOOTER, BUTTONS)' })
  @IsArray()
  @IsNotEmpty()
  components: Array<{
    type?: string
    text?: string
    format?: string
    example?: Record<string, unknown>
    buttons?: Array<Record<string, unknown>>
  }>
}

export class UpdateMetaTemplateDto {
  @ApiProperty({ description: 'Institution ID' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({ description: 'Template category' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ description: 'Updated template components' })
  @IsArray()
  @IsNotEmpty()
  components: Array<{
    type?: string
    text?: string
    format?: string
    example?: Record<string, unknown>
    buttons?: Array<Record<string, unknown>>
  }>
}

export class MigrateMetaTemplatesDto {
  @ApiProperty({ description: 'Source WABA ID to migrate templates from' })
  @IsString()
  @IsNotEmpty()
  sourceWabaId: string
}
