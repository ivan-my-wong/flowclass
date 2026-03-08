import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional } from 'class-validator'

import { IsISOTimeString } from '@/common/decorators/time-string.decorator'

export class PeriodLessonDto {
  @ApiProperty({ example: '2023-06-17T13:00:00.000Z' })
  @IsISOTimeString()
  startTime: Date

  @ApiProperty({ example: '2023-06-17T15:00:00.000Z' })
  @IsISOTimeString()
  endTime: Date

  static example_with_id = {
    id: 1,
    classId: 1,
    periodId: 1,
    startTime: '2023-06-17T13:00:00.000Z',
    endTime: '2023-06-17T15:00:00.000Z',
  }

  static type_definition = {
    type: 'object',
    properties: {
      startTime: { type: 'string' },
      endTime: { type: 'string' },
    },
  }
}

export class CreateLessonDTO extends PeriodLessonDto {
  classId: number

  @ApiProperty({
    example: 0,
  })
  @IsInt()
  periodId: number

  @ApiProperty({ example: '2023-06-17T13:00:00.000Z' })
  @IsISOTimeString()
  startTime: Date

  @ApiProperty({ example: '2023-06-17T15:00:00.000Z' })
  @IsISOTimeString()
  endTime: Date

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  createdBy?: number

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  updatedBy?: number
}

export class UpdateLessonDTO extends PeriodLessonDto {
  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  id: number
}

export class DeleteLessonDTO {
  @ApiProperty({
    example: 0,
  })
  @IsInt()
  classId: number

  @ApiProperty({
    example: 0,
  })
  @IsInt()
  lessonId: number
}

export class ValidatelessonsDto {
  @ApiProperty({
    example: 0,
    required: false,
  })
  @IsInt()
  @IsOptional()
  classId: number

  @ApiProperty({
    example: [],
    isArray: true,
    type: UpdateLessonDTO,
    required: false,
  })
  @Type(() => UpdateLessonDTO)
  @IsArray()
  @IsOptional()
  lessons: UpdateLessonDTO[]
}
