import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsObject, IsOptional } from 'class-validator'

import { AssociatedClassType } from '@/models/notification-record.entity'

export class SettingNotificationsDTO {
  siteId: number
  institutionId: number

  @ApiPropertyOptional({
    example: false,
  })
  displayEmailLogo: boolean

  @ApiPropertyOptional({
    example: false,
  })
  sendReminders: boolean
}

export class UpdateSettingNotificationsDTO {
  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  displayEmailLogo: boolean

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  customEmailSender: boolean

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  sendReminders: boolean

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  sendLessonReminders: boolean

  @ApiPropertyOptional({
    example: 'This is a friendly reminder',
  })
  @IsOptional()
  customMessage: string

  @ApiPropertyOptional({
    example: 'whatsapp token',
  })
  @IsOptional()
  wtsApiToken: string

  @ApiPropertyOptional({
    example: 'whatsapp api sid',
  })
  @IsOptional()
  wtsApiSid: string

  @ApiPropertyOptional({
    example: 'whatsapp api phone number',
  })
  @IsOptional()
  wtsApiPhoneNumber: string
}

export enum SendWtsDTOExample {
  siteId = 1,
  institutionId = 1,
  customMessage = 'This is a friendly reminder',
  wtsApiToken = 'your-whatsapp-api-token',
  wtsApiSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  wtsApiPhoneNumber = '+1234567890',
  studentPhone = '+1234567890',
}

export class SendWtsDTO {
  @ApiPropertyOptional({
    example: SendWtsDTOExample.siteId,
  })
  @IsOptional()
  siteId: number

  @ApiPropertyOptional({
    example: SendWtsDTOExample.institutionId,
  })
  @IsOptional()
  institutionId: number

  @ApiPropertyOptional({
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  templateId: number

  @ApiPropertyOptional({
    example: {},
    required: true,
  })
  @IsObject()
  variables: Record<string, any>

  @ApiPropertyOptional({
    example: SendWtsDTOExample.wtsApiToken,
  })
  @IsOptional()
  wtsApiToken: string

  @ApiPropertyOptional({
    example: SendWtsDTOExample.wtsApiSid,
  })
  @IsOptional()
  wtsApiSid: string

  @ApiPropertyOptional({
    example: SendWtsDTOExample.wtsApiPhoneNumber,
  })
  @IsOptional()
  wtsApiPhoneNumber: string

  @ApiPropertyOptional({
    example: SendWtsDTOExample.studentPhone,
  })
  @IsOptional()
  studentPhone: string
}

export class SendWtsCourseNotiDto {
  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  siteId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  recipientUserId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  courseId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  classId: number

  @ApiPropertyOptional({
    example: 'studentFirstName',
  })
  @IsOptional()
  studentFirstName: string

  @ApiProperty({
    example: 'adminPhoneNumber',
  })
  @IsNotEmpty()
  adminPhone: string

  @ApiProperty({
    example: 'studentPhone',
  })
  @IsNotEmpty()
  studentPhone: string
}

export class SendEmailIdBaseDto {
  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  recipientUserId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  siteId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  courseId: number

  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  classId: number

  @ApiProperty({
    example: 'abc@email.com',
  })
  @IsNotEmpty()
  adminEmail: string

  @ApiPropertyOptional({
    example: '85223456789',
  })
  @IsOptional()
  adminPhone: string

  @ApiPropertyOptional({
    example: 'studentFirstName',
  })
  @IsOptional()
  studentFirstName: string

  @ApiPropertyOptional({
    example: 'studentName',
  })
  @IsOptional()
  studentName?: string

  @ApiPropertyOptional({
    example: '85223456789',
  })
  @IsOptional()
  studentPhone?: string

  @ApiProperty({
    example: 'abc@email.com',
  })
  @IsNotEmpty()
  studentEmail: string
}

export class CourseDataNotiDto {
  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  periodId: number

  @ApiPropertyOptional({
    example: 'class name',
  })
  @IsOptional()
  className: string

  @ApiPropertyOptional({
    example: 0,
  })
  @IsOptional()
  price: number

  @ApiPropertyOptional({
    example: 'course name',
  })
  @IsOptional()
  courseName: string

  @ApiPropertyOptional({
    example: '2024-03-05T06:45:00.000Z 2024-03-05T07:45:00.000Z',
  })
  @IsOptional()
  classLessonDate: string

  @ApiProperty({
    example: 'timezone',
  })
  @IsNotEmpty()
  timeZone: string

  @ApiProperty({
    example: 'institutionName',
  })
  @IsNotEmpty()
  institutionName: string

  @ApiPropertyOptional({
    example: 'address',
  })
  @IsOptional()
  location: string

  @ApiPropertyOptional({
    example: 'instructorName',
  })
  @IsOptional()
  instructor?: string

  associatedClass?: AssociatedClassType | AssociatedClassType[]
}

export class ApplicationLinkEmailDTO extends IntersectionType(
  SendEmailIdBaseDto,
  CourseDataNotiDto
) {
  @ApiProperty({
    example: 'applicationLink',
  })
  @IsNotEmpty()
  applicationLink: string
}

export class ChangeLessonEmailDTO extends IntersectionType(SendEmailIdBaseDto, CourseDataNotiDto) {
  @ApiProperty({
    example: '2024-03-05T06:45:00.000Z 2024-03-05T07:45:00.000Z',
  })
  @IsNotEmpty()
  newClassLessonDate: string
}

export class AddLessonEmailDTO extends IntersectionType(SendEmailIdBaseDto, CourseDataNotiDto) {
  @ApiProperty({
    example: '2024-03-05T06:45:00.000Z 2024-03-05T07:45:00.000Z',
  })
  @IsNotEmpty()
  extraClassLessonDate: string
}

export class ChangeLessonWtsDTO extends IntersectionType(SendWtsCourseNotiDto, CourseDataNotiDto) {
  @ApiProperty({
    example: '2024-03-05T06:45:00.000Z 2024-03-05T07:45:00.000Z',
  })
  @IsNotEmpty()
  newClassLessonDate: string
}

export class AddLessonWtsDTO extends IntersectionType(SendWtsCourseNotiDto, CourseDataNotiDto) {
  @ApiProperty({
    example: '2024-03-05T06:45:00.000Z 2024-03-05T07:45:00.000Z',
  })
  @IsNotEmpty()
  newClassLessonDate: string
}

export class CreateSettingNotificationsDTO extends UpdateSettingNotificationsDTO {
  siteId: number
  institutionId: number
}

// schema for Swagger output example
export const SettingNotificationsSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        displayEmailLogo: {
          type: 'boolean',
          example: false,
        },
        sendReminders: {
          type: 'boolean',
          example: false,
        },
      },
    },
    message: {
      type: 'string',
      example: 'Success',
    },
    status: {
      type: 'number',
      example: 200,
    },
  },
}

export type SendInviteEmailDto = {
  siteDomain: string
  inviteLink: string
  inviterName: string
  userRole: string
  invitedUserEmail: string
}
