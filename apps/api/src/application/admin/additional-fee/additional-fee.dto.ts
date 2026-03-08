import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'

import { AdditionalFeeConditions, DiscountType } from '@/models/enums/'
import { CouponStatus } from '@/models/enums/status'

export class CreateAdditionalFeeDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  feeType: DiscountType

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(CouponStatus)
  status: CouponStatus

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(AdditionalFeeConditions)
  condition: AdditionalFeeConditions
}

export class AssignAdditionalFeeToCourseDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  additionalFeeId: number
}
