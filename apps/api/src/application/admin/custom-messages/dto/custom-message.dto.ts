import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

import * as vars from '@/common/constants/custom-message'
import { IMessageVariable } from '@/common/constants/custom-message'

export enum SupportedType {
  ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'admin_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'student_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_PAYMENT_APPROVED = 'student_notif_after_payment_approved',
  STUDENT_NOTIF_AFTER_PAYMENT_REJECTED = 'student_notif_after_payment_rejected',
  // STUDENT_NOTIF_AFTER_APPLICATION_CONFIRMED = 'student_notif_after_application_confirmed',
  // TEACHER_NOTIF_AFTER_APPLICATION_SUBMITTED = 'teacher_notif_after_application_submitted',
  STUDENT_NOTIF_AFTER_ADD_NEW_CLASS = 'student_notif_after_add_new_class',
  ADMIN_NOTIF_AFTER_ADD_NEW_CLASS = 'admin_notif_after_add_new_class',
  STUDENT_NOTIF_AFTER_ADD_NEW_LESSON = 'student_notif_after_add_new_lesson',
  STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE = 'student_notif_after_change_lesson_date',
  STUDENT_NOTIF_PAYMENT_REMINDER = 'student_notif_payment_reminder',
  STUDENT_LESSON_REMINDER = 'student_lesson_reminder',
  CREATE_INVOICE = 'create_invoice',
}

export type SupportedTypeVariables = {
  type: SupportedType
  variables: IMessageVariable[]
}

// Frequently used variable groups
const STUDENT_BASIC_INFO = [vars.STUDENT_NAME_VAR, vars.STUDENT_EMAIL_VAR, vars.STUDENT_PHONE_VAR]

const ADMIN_BASIC_INFO: IMessageVariable[] = [vars.ADMIN_EMAIL_VAR, vars.ADMIN_PHONE_VAR]

const CLASS_BASIC_INFO: IMessageVariable[] = [
  vars.CLASS_NAME_VAR,
  vars.COURSE_NAME_VAR,
  vars.SCHOOL_NAME_VAR,
]

const PAYMENT_INFO: IMessageVariable[] = [
  vars.PAYMENT_AMOUNT_VAR,
  vars.PAYMENT_METHOD_VAR,
  vars.PAYMENT_STATUS_VAR,
  vars.UPLOAD_PAYMENT_URL_VAR,
]

const LESSON_INFO: IMessageVariable[] = [
  vars.CLASS_LESSON_DATE_VAR,
  vars.LESSON_TIME_VAR,
  vars.DURATION_VAR,
  vars.INSTRUCTOR_VAR,
  vars.LOCATION_VAR,
]

const ENROLL_INFO: IMessageVariable[] = [
  vars.ENROLL_ID_VAR,
  vars.COURSE_NAME_VAR,
  vars.CLASS_NAME_VAR,
  vars.CLASS_DATETIME_VAR,
  vars.UPLOAD_PAYMENT_URL_VAR,
]

export const supportedTypeVariables: SupportedTypeVariables[] = [
  {
    type: SupportedType.ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED,
    variables: [
      ...ADMIN_BASIC_INFO,
      vars.ADMIN_NAME_VAR,
      ...CLASS_BASIC_INFO,
      ...STUDENT_BASIC_INFO,
      vars.LOCATION_VAR,
      vars.INSTRUCTOR_VAR,
    ],
  },
  {
    type: SupportedType.CREATE_INVOICE,
    variables: [...CLASS_BASIC_INFO, vars.STUDENT_NAME_VAR, ...PAYMENT_INFO],
  },
  {
    type: SupportedType.STUDENT_LESSON_REMINDER,
    variables: [
      vars.STUDENT_NAME_VAR,
      vars.CLASS_NAME_VAR,
      ...LESSON_INFO,
      ...ADMIN_BASIC_INFO,
      vars.SCHOOL_NAME_VAR,
    ],
  },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_ADD_NEW_LESSON,
    variables: [
      vars.STUDENT_NAME_VAR,
      ...CLASS_BASIC_INFO,
      ...LESSON_INFO,
      vars.UPLOAD_PAYMENT_URL_VAR,
    ],
  },
  // {
  //   type: SupportedType.STUDENT_NOTIF_AFTER_APPLICATION_CONFIRMED,
  //   variables: [
  //     ...CLASS_BASIC_INFO,
  //     vars.STUDENT_NAME_VAR,
  //     vars.INSTRUCTOR_VAR,
  //     vars.LOCATION_VAR,
  //     ...ADMIN_BASIC_INFO,
  //   ],
  // },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE,
    variables: [
      vars.STUDENT_NAME_VAR,
      ...CLASS_BASIC_INFO,
      vars.CLASS_LESSON_DATE_VAR,
      vars.NEW_CLASS_LESSON_DATE_VAR,
      ...ADMIN_BASIC_INFO,
      vars.LOCATION_VAR,
      vars.INSTRUCTOR_VAR,
    ],
  },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED,
    variables: [
      ...CLASS_BASIC_INFO,
      ...STUDENT_BASIC_INFO,
      ...ADMIN_BASIC_INFO,
      ...ENROLL_INFO,
      vars.UPLOAD_PAYMENT_URL_VAR,
      vars.PAYMENT_AMOUNT_VAR,
      vars.LOCATION_VAR,
      vars.INSTRUCTOR_VAR,
    ],
  },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED,
    variables: [
      ...CLASS_BASIC_INFO,
      vars.STUDENT_NAME_VAR,
      ...PAYMENT_INFO,
      vars.SUCCESS_PAYMENT_LINK_VAR,
      vars.PAYMENT_AMOUNT_VAR,
      vars.LOCATION_VAR,
      vars.INSTRUCTOR_VAR,
    ],
  },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_REJECTED,
    variables: [
      vars.STUDENT_NAME_VAR,
      ...CLASS_BASIC_INFO,
      ...ADMIN_BASIC_INFO,
      vars.UPLOAD_PAYMENT_URL_VAR,
    ],
  },
  {
    type: SupportedType.STUDENT_NOTIF_PAYMENT_REMINDER,
    variables: [vars.STUDENT_NAME_VAR, ...CLASS_BASIC_INFO, ...PAYMENT_INFO, ...ADMIN_BASIC_INFO],
  },
  {
    type: SupportedType.STUDENT_NOTIF_AFTER_ADD_NEW_CLASS,
    variables: [
      vars.INSTRUCTOR_VAR,
      vars.LOCATION_VAR,
      vars.SCHOOL_NAME_VAR,
      vars.STUDENT_NAME_VAR,
      vars.COURSE_NAME_VAR,
      ...ADMIN_BASIC_INFO,
    ],
  },

  // {
  //   type: SupportedType.TEACHER_NOTIF_AFTER_APPLICATION_SUBMITTED,
  //   variables: [...CLASS_BASIC_INFO, vars.STUDENT_NAME_VAR, ...ADMIN_BASIC_INFO],
  // },
]

export class CreateCustomMessageDTO {
  @ApiProperty({
    description: 'Id of custom message',
    example: 1,
  })
  @IsNumber()
  // If id is provided, then we will update the custom message
  @IsOptional()
  id?: number

  @ApiProperty({
    description: 'The name of the custom message',
    example: 'Custom Message',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'The content of the custom message',
    example: 'Custom Message',
  })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty({
    description: 'The type of the custom message',
    enum: SupportedType,
    example: SupportedType.ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED,
  })
  @IsEnum(SupportedType)
  @IsNotEmpty()
  type: SupportedType

  @ApiProperty({
    description: 'The variables of the custom message',
    example: supportedTypeVariables[0],
  })
  @IsObject()
  @IsOptional()
  variables: Record<string, any>

  @ApiProperty({
    description: 'The email notification of the custom message',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value ?? false)
  emailNotification: boolean

  @ApiProperty({
    description: 'The whatsapp notification of the custom message',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value ?? false)
  whatsappNotification: boolean
}
