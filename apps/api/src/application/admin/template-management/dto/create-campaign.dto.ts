import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { DocumentCampaignStatus } from '@/models/document-campaign.entity'

export class CreateDocumentCampaignDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({
    description: 'Document ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  documentId: number

  @ApiProperty({
    description: 'Course ID (optional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  courseId?: number

  @ApiProperty({
    description: 'Class ID (optional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  classId?: number

  @ApiProperty({
    description: 'Email subject',
    example: 'Congratulations on Your Achievement!',
  })
  @IsNotEmpty()
  @IsString()
  emailSubject: string

  @ApiProperty({
    description: 'Email body',
    example: 'Dear [Name],\n\nCongratulations on completing the course!',
  })
  @IsNotEmpty()
  @IsString()
  emailBody: string

  @ApiProperty({
    description: 'Campaign title',
    example: 'Course Completion Campaign',
  })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({
    description: 'Number of recipients',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  recipients: number

  @ApiProperty({
    description: 'List of recipient IDs',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  recipientIds: number[]

  @ApiProperty({
    description: 'Campaign status',
    enum: DocumentCampaignStatus,
    example: DocumentCampaignStatus.PENDING,
    default: DocumentCampaignStatus.PENDING,
  })
  @IsNotEmpty()
  @IsString()
  status: DocumentCampaignStatus
}
