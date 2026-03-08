import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { RepeatUnit } from '@/models/classes.entity'

export class LessonDateDTO {
  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  // @Validate(LessonExistsRule, { message: "doesn't exist" })
  id: number

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  classId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  weekDay: number

  @ApiProperty({ example: '2023-06-17T13:00:00.000Z' })
  @IsNotEmpty()
  @IsString()
  startTime: string

  @ApiProperty({ example: '2023-06-17T15:00:00.000Z' })
  @IsNotEmpty()
  @IsString()
  endTime: string

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  deleted?: boolean

  static example_with_id = {
    id: null,
    name: 'Period #1',
    repeatUnit: RepeatUnit.weeks,
    lessons: [
      '2023-06-17T13:00:00.000Z 2023-06-17T15:00:00.000Z',
      '2023-06-18T13:00:00.000Z 2023-06-18T15:00:00.000Z',
      '2023-06-19T13:00:00.000Z 2023-06-19T15:00:00.000Z',
    ],
    duration: 120,
    orderIndex: 1,
  }

  static lessons_local = [
    '2023-06-17T13:00:00.000+08:00 2023-06-17T15:00:00.000+08:00',
    '2023-06-18T13:00:00.000+08:00 2023-06-18T15:00:00.000+08:00',
    '2023-06-19T13:00:00.000+08:00 2023-06-19T15:00:00.000+08:00',
  ]

  static example_without_id = {
    name: 'Period #1',
    repeatType: RepeatUnit.weeks,
    lessons: [
      '2023-06-17T13:00:00.000Z 2023-06-17T15:00:00.000Z',
      '2023-06-18T13:00:00.000Z 2023-06-18T15:00:00.000Z',
      '2023-06-19T13:00:00.000Z 2023-06-19T15:00:00.000Z',
    ],
    duration: 120,
    orderIndex: 1,
  }
}

// export class GetLessonDTO {
//   @ApiProperty({
//     example: 0,
//   })
//   @IsInt()
//   classId: number;
// }

// export class CreateLessonDTO extends LessonDTO {
//   @ApiProperty({
//     example: 0,
//   })
//   @IsInt()
//   classId: number;

//   @ApiProperty({ example: Period.example })
//   @Type(() => Period)
//   @ValidateNested({ each: true })
//   period: Period;
// }

// export class UpdateLessonDateDTO extends CreateLessonDTO {
//   @ApiProperty({
//     example: 0,
//   })
//   @IsInt()
//   id: number;
// }

// export class DeleteLessonDTO extends CourseDTO {
//   @ApiProperty({
//     example: 0,
//   })
//   @IsInt()
//   classId: number;

//   @ApiProperty({
//     example: 0,
//   })
//   @IsInt()
//   lessonId: number;

//   @ApiPropertyOptional()
//   @IsInt()
//   @IsOptional()
//   createdBy?: number;

//   @ApiPropertyOptional()
//   @IsInt()
//   @IsOptional()
//   updatedBy?: number;
// }
