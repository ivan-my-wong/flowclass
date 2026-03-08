import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

import { IsISOTimeString } from '@/common/decorators/time-string.decorator'

import { CreateRepeatFormatDto } from '../../institutions/dto/institution-repeat-format.dto'

import { PeriodLessonDto } from './create-or-update-lessons.dto'

export class CreateRegularPeriodsDto {
  institutionId: number

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  courseId: number

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  classId: number

  @ApiPropertyOptional({
    example: 'Phase Name',
  })
  @IsString()
  @IsOptional()
  name: string

  @ApiProperty({
    example: 30,
  })
  @IsInt()
  duration: number

  @ApiPropertyOptional({
    example: [
      {
        id: 1,
        classId: 1,
        periodId: 1,
        startTime: '2023-06-17T13:00:00.000Z',
        endTime: '2023-06-17T15:00:00.000Z',
      },
    ],
  })
  @IsOptional()
  @IsNotEmpty()
  @Type(() => PeriodLessonDto)
  lessons: PeriodLessonDto[]

  @ApiProperty({
    example: { every: 1, unit: 'weeks', repeat: true, times: 1 },
  })
  @IsObject()
  @IsOptional()
  repeatFormat: CreateRepeatFormatDto

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  createdBy: number

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  @IsOptional()
  updatedBy: number

  static example_without_id = {
    duration: 30,
    lessons: [
      {
        id: 1,
        classId: 1,
        periodId: 1,
        startTime: '2023-06-17T13:00:00.000Z',
        endTime: '2023-06-17T15:00:00.000Z',
      },
    ],
    repeatFormat: { every: 1, unit: 'weeks', repeat: true, times: 1 },
    createdBy: 0,
    updatedBy: 0,
  }

  static type_definition = {
    type: 'object',
    properties: {
      courseId: { type: 'number' },
      classId: { type: 'number' },
      name: { type: 'string' },
      duration: { type: 'number' },
      lessons: { type: 'array' },
      repeatFormat: { type: 'object' },
      createdBy: { type: 'number' },
      updatedBy: { type: 'number' },
    },
  }
}

export class UpdateRegularPeriodsDto extends CreateRegularPeriodsDto {
  @ApiProperty({
    example: 0,
  })
  @IsInt()
  id: number

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  deleted: boolean

  static type_definition = {
    ...CreateRegularPeriodsDto.type_definition,
    properties: {
      ...CreateRegularPeriodsDto.type_definition.properties,
      id: { type: 'number' },
      deleted: { type: 'boolean' },
    },
  }

  static example_with_id = {
    id: 1,
    duration: 30,
    lessons: [
      {
        id: 1,
        classId: 1,
        periodId: 1,
        startTime: '2023-06-17T13:00:00.000Z',
        endTime: '2023-06-17T15:00:00.000Z',
      },
    ],
    repeatFormat: { every: 1, unit: 'weeks', repeat: true, times: 1 },
    createdBy: 0,
    updatedBy: 0,
  }
}

export class UpdatePeriodLessonsDto {
  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  classId?: number

  @ApiProperty({ example: 'YYYY-MM-DDThh:mm:ss.aaaZ' })
  @IsISOTimeString()
  startTime: Date

  @ApiProperty({ example: 'YYYY-MM-DDThh:mm:ss.aaaZ' })
  @IsISOTimeString()
  endTime: Date

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean

  static example = {
    id: null,
    startTime: '2023-05-16T01:30:00.000Z',
    endTime: '2023-05-16T03:30:00.000Z',
    deleted: false,
  }

  static example_no_id = {
    startTime: '2023-05-16T01:30:00.000Z',
    endTime: '2023-05-16T03:30:00.000Z',
  }

  static type_definition = {
    type: 'object',
    properties: {
      id: { type: 'number' },
      classId: { type: 'number' },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      deleted: { type: 'boolean' },
    },
  }
}
