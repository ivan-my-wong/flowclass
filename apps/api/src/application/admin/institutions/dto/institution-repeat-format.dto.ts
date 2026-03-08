import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

import { RepeatUnit } from '@/models/classes.entity'

export class CreateRepeatFormatDto {
  institutionId: number

  @ApiPropertyOptional({ example: 1, description: 'ID for updating existing repeat format' })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiProperty()
  @IsBoolean()
  repeat: boolean

  @ApiProperty()
  @IsInt()
  every: number

  @ApiProperty()
  @IsEnum(RepeatUnit)
  unit: RepeatUnit

  @ApiProperty()
  @IsInt()
  times: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  startTime?: string

  @ApiProperty({
    description: 'Ordinal occurrence of weekday in month (1-4 for first to fourth, -1 for last)',
    minimum: -1,
    maximum: 4,
    required: false,
  })
  @IsInt()
  @Min(-1)
  @Max(4)
  @IsOptional()
  weekdayOccurrence?: number

  @ApiProperty({
    description: 'Day of week as integer (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  weekday?: number
}

export class UpdateRepeatFormatDto extends CreateRepeatFormatDto {
  @ApiProperty()
  @IsInt()
  id: number
}
