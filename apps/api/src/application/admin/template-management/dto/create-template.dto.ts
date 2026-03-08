import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import {
  DocumentTemplateStatus,
  DocumentTemplateType,
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/models/document-template.entity'

export class CreateDocumentTemplateDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({
    description: 'Template name',
    example: 'Certificate of Completion',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    description: 'Template status',
    enum: DocumentTemplateStatus,
    example: DocumentTemplateStatus.ACTIVE,
    default: DocumentTemplateStatus.ACTIVE,
  })
  @IsNotEmpty()
  @IsString()
  status: DocumentTemplateStatus

  @ApiProperty({
    description: 'Field data for the template',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        fontSize: { type: 'number' },
        color: { type: 'string' },
      },
    },
    example: [
      {
        id: 'field1',
        name: 'Name',
        x: 100,
        y: 200,
        fontSize: 16,
        color: '#000000',
      },
    ],
    required: false,
  })
  @IsOptional()
  fieldData?: TemplateFieldData[]

  @ApiProperty({
    description: 'Background properties for the template',
    type: 'object',
    properties: {
      url: { type: 'string', example: 'https://example.com/background.png' },
      width: { type: 'number', example: 800 },
      height: { type: 'number', example: 600 },
    },
    required: false,
  })
  @IsOptional()
  background?: TemplateBackgroundProps

  @ApiProperty({
    description: 'Type of the document template',
    enum: DocumentTemplateType,
    example: DocumentTemplateType.CERTIFICATE,
  })
  @IsNotEmpty()
  @IsString()
  type: DocumentTemplateType
}
