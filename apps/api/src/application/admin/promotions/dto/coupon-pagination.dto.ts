import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { DiscountType } from '@/models/enums/'

export class CouponPageDto {
  @ApiProperty()
  @IsArray()
  content: []

  @ApiProperty()
  @IsObject()
  meta: Record<string, any>
}

export class CouponPageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiPropertyOptional({ enum: DiscountType, default: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType: DiscountType
}
