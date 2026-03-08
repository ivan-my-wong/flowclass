import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

import { defaultSupportedLanguages, supportedLanguagesObject } from '@/common/constants/locales'
import { WhatsappTemplateCategory, WhatsappTemplateLanguage } from '@/models/enums/status'
import {
  IsValidWhatsappTemplateName,
  whatsappTemplateNameDefaultMessage,
} from '@/utils/validate/whatsapp-template-name.utils'

export class WhatsappTemplateDTO {
  @ApiProperty({
    example: 'Name of the template',
    required: true,
  })
  @IsNotEmpty()
  @IsValidWhatsappTemplateName({
    message: whatsappTemplateNameDefaultMessage,
  })
  name: string

  @ApiProperty({
    example: 'This is a template',
    required: true,
  })
  @IsNotEmpty()
  content: string

  @ApiProperty({
    example: defaultSupportedLanguages,
    enum: supportedLanguagesObject,
    enumName: 'WhatsappTemplateLanguage',
    default: defaultSupportedLanguages,
  })
  @IsNotEmpty()
  @IsString()
  language: string

  @ApiProperty({
    example: WhatsappTemplateCategory.UTILITY,
    enum: WhatsappTemplateCategory,
    enumName: 'WhatsappTemplateCategory',
    default: WhatsappTemplateCategory.UTILITY,
  })
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({
    example: {},
    required: true,
  })
  @IsObject()
  @IsOptional()
  // @IsNotEmpty()
  assignedTo: Record<string, any>

  @ApiProperty({
    example: {
      '1': 'name',
      '2': 'address',
    },
    required: false,
  })
  @IsObject()
  variables: Record<string, any>

  @ApiProperty({
    name: 'isDefault',
    example: true,
    default: false,
  })
  @IsBoolean()
  isDefault: boolean
}

export class WhatsappTemplateResponseDTO {
  @ApiProperty({
    example: 'Name of the template',
    required: true,
  })
  @Expose()
  name: string

  @ApiProperty({
    example: 'This is a template',
    required: true,
  })
  @Expose()
  content: string

  @ApiProperty({
    example: WhatsappTemplateLanguage.EN,
    enum: WhatsappTemplateLanguage,
    enumName: 'WhatsappTemplateLanguage',
  })
  @Expose()
  language: string

  @ApiProperty({
    example: WhatsappTemplateCategory.UTILITY,
    enum: WhatsappTemplateCategory,
    enumName: 'WhatsappTemplateCategory',
  })
  @Expose()
  category: string

  @ApiProperty({
    example: 1,
    required: true,
  })
  @Expose()
  assignedToId: number

  @ApiProperty({
    example: {
      '1': 'name',
      '2': 'address',
    },
    required: false,
  })
  @Expose()
  variables: Record<string, any>

  @ApiProperty({
    name: 'isDefault',
    example: true,
  })
  @Expose()
  isDefault: boolean
}
