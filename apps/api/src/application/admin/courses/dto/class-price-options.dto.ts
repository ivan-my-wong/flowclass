import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator'

import { PriceType } from '@/models/enums'

export class ClassPriceOptionDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number

  @ApiPropertyOptional({
    example: 'Single Lesson',
    description: 'Name of the price option. If not provided, will be auto-generated.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType

  @ApiProperty({ example: 1000, description: 'Price amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number

  @ApiProperty({ example: 10, description: 'Number of lessons this price covers' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numberOfLessons: number
}
