import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

import { Coupon } from '@/models/coupons.entity'

import { couponSchema } from './coupon.schema'

export class StudentCalculateCouponPriceDto {
  @ApiProperty()
  @IsString()
  couponCode: string

  @ApiProperty()
  @IsNumber()
  courseId: number

  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsNumber()
  initialPrice: number
}

export class StudentCalculateCouponPriceResponse {
  @ApiProperty({
    example: couponSchema,
  })
  coupon: Coupon

  @ApiProperty({
    example: 1234,
  })
  couponPrice: number

  @ApiProperty({
    example: 123,
  })
  amountReduced: number
}

export class StudentValidCouponDto {
  @ApiProperty()
  @IsString()
  couponCode: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  enrolToken?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  invoiceId?: number

  @ApiProperty()
  @IsNumber()
  institutionId: number
}

export class StudentValidCouponResponseDto {
  @ApiProperty()
  @IsBoolean()
  valid: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  coupon?: Coupon | null

  @ApiProperty()
  @IsString()
  message: string
}

export class StudentEnrolTokenDto {
  @ApiProperty()
  @IsString()
  enrolToken: string
}
