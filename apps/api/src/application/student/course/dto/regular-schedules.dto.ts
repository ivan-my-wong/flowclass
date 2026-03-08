import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

// Student DTOs for regular schedule preview
export class GetRegularSchedulePreviewDto {
  @ApiProperty({ example: 1, description: 'Regular schedule ID' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  scheduleId: number

  @ApiPropertyOptional({
    example: 0,
    description: 'Starting schedule index (0-based)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  startingScheduleIndex?: number

  @ApiPropertyOptional({
    example: 5,
    description: 'Number of preview periods to generate',
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  previewPeriodCount?: number
}

export class LessonPreviewDto {
  @ApiProperty({ example: 1, description: 'Lesson ID' })
  @IsNumber()
  id: number

  @ApiProperty({ example: '2025-01-20', description: 'Lesson date' })
  @IsString()
  date: string

  @ApiPropertyOptional({ example: 1, description: 'Period number' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  period?: number

  @ApiProperty({ example: 1, description: 'Lesson number within period' })
  @IsNumber()
  lessonNumber: number

  @ApiProperty({ example: '2025-01-20T09:00:00.000Z', description: 'Lesson start time' })
  @IsDate()
  @Type(() => Date)
  startTime: string

  @ApiProperty({ example: '2025-01-20T10:30:00.000Z', description: 'Lesson end time' })
  @IsDate()
  @Type(() => Date)
  endTime: string

  @ApiProperty({ example: false, description: 'Whether this is an override lesson' })
  @IsBoolean()
  isOverride: boolean

  @ApiProperty({ example: false, description: 'Whether this lesson is blocked' })
  @IsBoolean()
  isBlocked: boolean
}

export class RegularScheduleLessonPreviewPeriodGroup {
  @ApiProperty({ example: 1, description: 'Period number' })
  @IsNumber()
  @Type(() => Number)
  period: number

  @ApiProperty({ type: [LessonPreviewDto], description: 'List of preview lessons' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonPreviewDto)
  lessons: LessonPreviewDto[]
}

export class RegularSchedulePreviewPeriod {
  @ApiProperty({ example: '2025-01-20T09:00:00.000Z', description: 'Period start date' })
  startDate: string

  @ApiProperty({ example: '2025-01-20T10:30:00.000Z', description: 'Period end date' })
  endDate: string
}

export class RegularSchedulePreviewResponseDto {
  @ApiProperty({ example: 1, description: 'Regular schedule ID' })
  scheduleId: number

  @ApiProperty({ example: '2025-01-20T09:00:00.000Z', description: 'Schedule start time' })
  scheduleStartTime: string

  @ApiProperty({ example: 'weeks', description: 'Schedule repeat unit' })
  scheduleUnit: string

  @ApiProperty({ example: 1, description: 'Schedule repeat every' })
  scheduleEvery: number

  @ApiProperty({ type: [LessonPreviewDto], description: 'List of preview lessons' })
  lessons: LessonPreviewDto[]

  @ApiProperty({
    type: [RegularSchedulePreviewPeriod],
    description: 'List of preview periods',
  })
  schedules: RegularSchedulePreviewPeriod[]

  @ApiProperty({
    example: true,
    description: 'Whether there are more periods available beyond the current preview',
  })
  hasNextPeriod: boolean
}
