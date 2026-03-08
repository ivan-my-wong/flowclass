import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

@Exclude()
export class CheckCouponDto {
  @ApiProperty()
  @Expose()
  @IsString()
  code: string

  @ApiProperty()
  @Expose()
  @IsNumber()
  courseId: number

  @ApiProperty()
  @Expose()
  @IsString()
  type: string

  @ApiProperty()
  @Expose()
  @IsNumber()
  childId: number

  @ApiProperty()
  @Expose()
  @IsNumber()
  numberOfLesson: number
}
