import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  isDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator'

import { DiscountType } from '@/models/enums/'
import { CouponStatus } from '@/models/enums/status'

export class CouponDTO {
  siteId: number

  @ApiPropertyOptional({
    nullable: true,
    example: [1],
  })
  @IsArray()
  @IsOptional()
  courseIds: number[]

  @ApiPropertyOptional({
    nullable: true,
    example: [1],
  })
  @IsArray()
  @IsOptional()
  userIds: number[]

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(200)
  code: string

  @ApiProperty()
  @IsNotEmpty()
  quota: number

  @ApiProperty({ enum: DiscountType, default: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    isDefined(value) ? ['1', 1, 'true', true].includes(value) : value
  )
  forBundle: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    isDefined(value) ? ['1', 1, 'true', true].includes(value) : value
  )
  forTrialLesson: boolean

  @ApiProperty({ example: '2023-04-13T03:27:09.065Z' })
  @IsNotEmpty()
  @IsDateString()
  expireDate: string
}

export class CreateCouponDTO extends CouponDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    nullable: true,
    example: [1],
  })
  @IsArray()
  @IsOptional()
  classIds: number[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifyOn: boolean
}

export class UpdateCouponDTO extends PartialType(CouponDTO) {
  @ApiProperty({
    nullable: true,
    example: [1],
  })
  @IsArray()
  @IsOptional()
  deleteCourseIds: number[]
}

export class UpdateStatusCouponDTO {
  @ApiProperty({
    example: CouponStatus.ACTIVE,
  })
  @IsEnum(CouponStatus)
  @IsNotEmpty()
  status: CouponStatus
}
