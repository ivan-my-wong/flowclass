import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { PayoutPreferenceDto } from '@/application/admin/request-payout/dto/receive-Payout-Preference.dto'
import { EnrollIntoInfo } from '@/models/enroll-courses.entity'
import { PaymentMethod } from '@/models/enums/'
import { PayoutMethod } from '@/models/payout-method.entity'

import {
  StudentCreateEnrollCourseDto,
  StudentMetaRef,
  StudentMetaRefExtended,
} from './create-enroll-course.dto'

export class StudentUpdateEnrollCourseDto extends PartialType(StudentCreateEnrollCourseDto) {
  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number
}

export class UpdateInvoicePaymentDto {
  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number

  @ApiProperty({
    example: PaymentMethod.PAY_LATER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod

  @ApiProperty({
    example: PayoutPreferenceDto.example,
  })
  @IsOptional()
  @Type(() => PayoutMethod)
  payLaterMethod?: PayoutMethod

  @ApiProperty({
    example: '10%',
  })
  @IsOptional()
  @IsString()
  coupon?: string

  @ApiProperty({
    example: 'https://example.com?school=flowclass&course=regular',
  })
  @IsNotEmpty()
  @IsString()
  redirectUrl: string

  @ApiProperty({
    example: [StudentMetaRef.example],
    isArray: true,
    type: StudentMetaRef,
    items: {
      type: 'object',
      properties: {
        ...StudentMetaRef.type_definition.properties,
      },
    },
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => StudentMetaRef)
  selectedClassMeta: StudentMetaRef[]
}

export class StudentReCreateStripeClientSecretDto {
  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 4500,
  })
  @IsNotEmpty()
  @IsNumber()
  paymentAmount: number

  @ApiProperty({
    example: 'https://example.com?school=flowclass&course=regular',
  })
  @IsNotEmpty()
  @IsString()
  redirectUrl: string
}

export class StudentUpdateEnrollCourseMetaDto {
  siteId: number
  institutionId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: StudentMetaRefExtended,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StudentMetaRefExtended)
  meta: StudentMetaRefExtended

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  enrollInto: EnrollIntoInfo

  @ApiProperty({
    example: 'https://example.com',
  })
  @IsNotEmpty()
  @IsString()
  redirectUrl: string

  @ApiProperty({
    example: PaymentMethod.PAY_LATER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: string

  @ApiProperty({
    example: PayoutPreferenceDto.example,
  })
  @IsOptional()
  @Type(() => PayoutMethod)
  payLaterMethod?: PayoutMethod

  // @ApiProperty({
  //   example: object,
  // })
  // @Type(() => StudentSchedule)
  // @Expose()
  // studentSchedule?: StudentSchedule | StudentSchedule[];
}
