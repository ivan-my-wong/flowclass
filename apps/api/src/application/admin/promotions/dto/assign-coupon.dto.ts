import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator'

import { Coupon } from '@/models/coupons.entity'

export class AssignCouponDto {
  @ApiProperty()
  @Expose()
  @IsArray()
  userIds: number[]

  @ApiProperty()
  @Expose()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @Expose()
  coupon: Coupon

  @ApiProperty()
  @Expose()
  @IsString()
  educatorName: string

  @ApiProperty()
  @Expose()
  @IsNumber()
  educatorId: number

  @ApiProperty()
  @Expose()
  @IsBoolean()
  emailNotifyOn: boolean
}
