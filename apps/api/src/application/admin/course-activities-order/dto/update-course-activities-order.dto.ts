import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber } from 'class-validator'

export class UpgradeCourseActivitiesOrderDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: 1,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  order: number[]
}
