import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator'

export class StudentCheckAvailableTrialLessonDto {
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  courseId: number

  @ApiProperty({
    example: [1],
  })
  @IsArray()
  @IsNotEmpty()
  classIds: number[]
}
