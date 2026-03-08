import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'

import { PaymentMethod } from '@/models/enums/'
import { EnrollConfirmStatus } from '@/models/enums/status'

export class CreateEnrollCourseDto {
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
  classId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: PaymentMethod.PAY_LATER,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({
    example: 'John',
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'Hong Kong School',
  })
  @IsNotEmpty()
  school: string
}

@Exclude()
export class EnrollCourseResponse {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  userId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  classId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  courseId: number

  @ApiProperty({
    example: EnrollConfirmStatus.PENDING,
  })
  @Expose()
  confirmState: string

  @ApiProperty({
    example: 'John',
  })
  @Expose()
  name: string

  @ApiProperty({
    example: 'Hong Kong School',
  })
  @Expose()
  school: string
}
