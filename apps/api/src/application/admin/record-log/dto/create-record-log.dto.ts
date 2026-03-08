import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator'

import { RecordLogType } from '@/models/enums/'

export class CreateRecordLogDto {
  @ApiProperty({
    example: 'CREATE_COUPON',
  })
  @IsNotEmpty()
  @IsEnum(RecordLogType)
  type: RecordLogType

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: {},
  })
  @IsNotEmpty()
  @IsObject()
  detail: object

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userId?: number
}
