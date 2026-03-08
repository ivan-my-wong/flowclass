import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator'

import { IsDateRange } from '@/common/decorators/is-date-range.decorator'
import { NotificationChannel, NotificationType } from '@/models/notification-record.entity'

import { SupportedType } from '../../custom-messages/dto/custom-message.dto'

export class RecordLogListDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 'CODE01',
  })
  @IsNotEmpty()
  @IsString()
  couponCode: string
}

export class StudentActivitiesDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  limit: number

  @ApiProperty({
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  page: number
}

export class GetNotificationLogDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiPropertyOptional({
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: '2024-07-05',
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  startTime: Date

  @ApiPropertyOptional({
    example: '2024-07-06',
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  endTime: Date
}

export class GetNotificationLogResponseDto {
  id: number
  createdAt: Date
  updatedAt: Date
  createdBy?: number
  updatedBy?: number
  channel: NotificationChannel
  recipientUserId: number
  institutionId: number
  siteId: number
  recipientUserEmail: string
  recipientUserPhone?: string
  messageId: string
  subject: string
  message?: string
  notificationType: NotificationType | SupportedType
}

interface INotificationLogFieldsType {
  id: boolean
  createdAt: boolean
  updatedAt: boolean
  createdBy: boolean
  updatedBy: boolean
}

export class GetNotificationLogSelectFieldsDto {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  search: string

  @ApiProperty({
    example: {
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
  })
  @IsOptional()
  @IsObject()
  select: Partial<INotificationLogFieldsType>

  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date

  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o) => o.startDate && o.endDate)
  @IsDateRange('startDate', {
    message: 'endDate must be after startDate',
  })
  endDate?: Date
}

export class GetRecordLogByContactDto {
  @ApiProperty({
    example: 1,
    description: 'Institution ID',
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email (optional, required if phone not provided)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.phone)
  @IsString()
  email?: string

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User phone (optional, required if email not provided)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string
}
