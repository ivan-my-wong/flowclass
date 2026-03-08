import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class CreateClassLessonDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  courseId: number

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  classId: number

  @IsNotEmpty()
  @ApiProperty()
  startTime: Date

  @IsNotEmpty()
  @ApiProperty()
  endTime: Date
}

export class UpdateClassLessonDto extends PartialType(CreateClassLessonDto) {
  @IsOptional()
  @ApiProperty()
  changeStartTime: Date

  @IsOptional()
  @ApiProperty()
  changeEndTime: Date
}
