import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsOptional, Max } from 'class-validator'

import { Order, OrderBy } from '@/models/enums/'

export class PageOptionsDto {
  @ApiPropertyOptional({
    enum: Order,
    default: Order.ASC,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.DESC

  @ApiPropertyOptional({
    enum: OrderBy,
    default: OrderBy.CREATED_AT,
  })
  @IsEnum(OrderBy)
  @IsOptional()
  readonly orderBy?: OrderBy = OrderBy.CREATED_AT

  @ApiPropertyOptional({
    minimum: 0,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number = 0

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Max(50)
  @IsOptional()
  num?: number = 0

  @ApiPropertyOptional({ default: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  allPage?: boolean = false
}
