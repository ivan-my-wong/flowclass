import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class GetSubscriptionPlansDto {
  @ApiPropertyOptional({ description: 'Plan type' })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({ description: 'Interval' })
  @IsOptional()
  @IsString()
  interval?: string

  @ApiPropertyOptional({ description: 'Plan tier' })
  @IsOptional()
  @IsString()
  tier?: string

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: 'Price mode' })
  @IsOptional()
  @IsString()
  priceMode?: string
}
