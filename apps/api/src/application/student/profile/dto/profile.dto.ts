import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator'

import { ConfirmPaymentWithoutReceiptDTO } from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import { PaymentMethod } from '@/models/enums'
import { AttendanceStatus, PaymentStatus } from '@/models/enums/status'

export class StudentCheckProfileDTO {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: 'ABC', required: false })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiProperty({ example: 'jhon@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ example: '+85212312312', required: true })
  @IsNotEmpty()
  @IsString()
  phone: string

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  activeUserAliasId?: number
}

export class StudentConfirmPaymentWithoutReceiptDTO extends ConfirmPaymentWithoutReceiptDTO {}

export class StudentResendPaymentRecordDTO {
  @ApiProperty()
  @IsArray()
  @ValidateIf((o) => (o.ids?.length || 0) <= 0)
  @ArrayNotEmpty()
  invoices?: StudentConfirmPaymentWithoutReceiptDTO[]
}

export class StudentResponseCheckProfileDTO {
  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  email: string

  @Expose()
  phone: string

  @Expose()
  accessToken: string

  @Expose()
  refreshToken: string
}

export class StudentResponsePaymentRecordsDTO {
  @Expose()
  id: number

  @Expose()
  classes: { id: number; name: string }[]

  @Expose()
  course: { id: number; name: string }

  @Expose()
  createdAt: string

  @Expose()
  paymentMethod: PaymentMethod

  @Expose()
  payAmount: number

  @Expose()
  proofToken: string

  @Expose()
  paymentLinkId: string

  @Expose()
  currency: string

  @Expose()
  paymentProof: string
}
export class MediaMaterialsDTO {
  @Expose()
  id: string
  @Expose()
  name: string
  @Expose()
  link: string
  @Expose()
  type: string
  @Expose()
  fileType: string
  @Expose()
  expiryDate: Date
  @Expose()
  driveId: string
  @Expose()
  fileId: string
}
export class StudentResponseUpcomingLessonDTO {
  @Expose()
  id: number

  @Expose()
  courseId: string

  @Expose()
  course: {
    id: string
    name: string
    previewImageUrl: string
  }

  @Expose()
  class: {
    id: string
    name: string
  }

  @Expose()
  startTime: Date

  @Expose()
  endTime: Date

  @Expose()
  originalStartTime: Date

  @Expose()
  originalEndTime: Date

  @Expose()
  hasTimeChange: boolean

  @Expose()
  invoice: {
    id: string
    payAmount: number
    paymentState: string
  }

  @Expose()
  isDone: boolean

  @Expose()
  materials: MediaMaterialsDTO[]

  @Expose()
  studentSubmissions: MediaMaterialsDTO[]
}

export class FilterPaymentRecordDTO {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: '2021-01-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string

  @ApiProperty({ example: '2021-01-01', required: false })
  @IsString()
  @IsOptional()
  endDate?: string

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  courseId?: number

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  classId?: number

  @ApiProperty({ example: PaymentStatus.PAID, required: false, enum: PaymentStatus })
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  @IsOptional()
  paymentState?: PaymentStatus[]

  @ApiProperty({ example: PaymentMethod.PAY_LATER, required: false, enum: PaymentMethod })
  @IsString()
  @IsOptional()
  paymentMethod?: PaymentMethod

  @ApiProperty({ example: AttendanceStatus.ATTENDED, required: false, enum: AttendanceStatus })
  @IsString()
  @IsOptional()
  attendanceStatus?: AttendanceStatus

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  childrenId?: number
}

export class StudentSendQuestionDTO {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: 'How are you?', required: true })
  @IsString()
  question: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  lessonId: number
}

export class RequestTimeChangeDTO {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: '2021-01-01', required: true })
  @IsString()
  @IsOptional()
  requestStartTime?: string

  @ApiProperty({ example: '2021-01-01', required: true })
  @IsString()
  @IsOptional()
  requestEndTime?: string

  @ApiProperty({ example: 'I am sick', required: false })
  @IsString()
  @IsOptional()
  reason?: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  lessonId: number

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  classId?: number
}
