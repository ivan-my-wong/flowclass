import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'

import { EnrollConfirmStatus } from '@/models/enums/status'

export class ConfirmStateEnrollCourseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number

  @ApiProperty({
    example: EnrollConfirmStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(EnrollConfirmStatus)
  confirmState: EnrollConfirmStatus
}
