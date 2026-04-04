import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

import { EnrollmentRecordDTO } from '@/application/admin/enroll-courses/dto/enrollmentRecord.dto'
import { EnrollIntoInfo } from '@/models/enroll-courses.entity'
import { PaymentMethod } from '@/models/enums/'
import { PaymentStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { User } from '@/models/user.entity'

export class StudentEnrollmentRecordDTO extends EnrollmentRecordDTO {}
export class StudentCreateInvoiceDTO {
  siteId: number
  institutionId: number
  courseId: number
  userId: number
  enrollId: number

  @ApiProperty({ example: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  paymentState: PaymentStatus

  @ApiProperty({ example: PaymentMethod.PAY_LATER })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  paymentLinkId: string

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsPositive()
  feePerLesson: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  numOfLesson: number

  @ApiProperty({ example: 10, default: 1 })
  @IsNumber()
  @IsPositive()
  numOfApplicant?: number

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @IsPositive()
  originalFee: number

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @IsPositive()
  payAmount: number

  @IsOptional()
  @IsNumber()
  amountPaid?: number

  @ApiPropertyOptional({ example: 'HKD' })
  @IsNotEmpty()
  @IsOptional()
  currency: string

  @ApiPropertyOptional({ example: 'Michael Old Man' })
  @IsPositive()
  @IsOptional()
  payBy: string

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  payById: number

  @ApiProperty({ example: 'Math 101 | Class A | 3 lessons' })
  @IsNotEmpty()
  enrollInto: EnrollIntoInfo

  @ApiPropertyOptional({ example: null })
  @IsString()
  @IsOptional()
  discounts: string

  @ApiProperty({ example: 0 })
  @IsInt()
  discountAmount: number

  @ApiProperty({ example: false })
  @IsBoolean()
  reviewed: boolean

  @ApiProperty({ example: null })
  @IsString()
  @IsOptional()
  approvedBy: string

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  approverId: number

  @ApiProperty({ example: null })
  @IsString()
  @IsOptional()
  proofToken: string
}

export class StudentCreateNewScheduleInInvoiceProps {
  @IsInt()
  periodId: number
}

export type PartialUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>

type InvoiceWithoutApplicants = Omit<Invoice, 'applicants'>

export type StudentInvoiceResponseDto = InvoiceWithoutApplicants & {
  applicants: PartialUser[]
}
