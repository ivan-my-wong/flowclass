import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

import {
  ClassRegularPeriodRepeatFormat,
  ClassRegularPeriodsSelectionMode,
} from '@/models/class-regular-schedules.entity'
import { RepeatUnit } from '@/models/classes.entity'

import { CreateRepeatFormatDto } from '../../institutions/dto/institution-repeat-format.dto'

// DTO for individual lesson periods within a schedule
export class CreateOrUpdateClassRegularPeriodDto {
  @ApiPropertyOptional({ example: 1, description: 'ID for updating existing period' })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiProperty({ example: 1, description: 'Class ID this period belongs to' })
  @IsOptional()
  @IsInt()
  classId?: number

  @ApiPropertyOptional({ example: 1, description: 'Lesson repeat format ID' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRepeatFormatDto)
  lessonRepeatFormat?: CreateRepeatFormatDto

  @ApiProperty({
    example: '2025-07-16T09:00:00.000Z',
    description: 'Start time for this lesson period',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date

  @ApiProperty({
    example: '2025-07-16T10:30:00.000Z',
    description: 'End time for this lesson period',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date
}

// Main schedule DTO that contains multiple periods
export class CreateClassRegularScheduleDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  classId: number

  @ApiPropertyOptional({
    example: { every: 1, unit: 'weeks', times: 1 },
    description: 'Period repeat format',
  })
  @IsOptional()
  @ValidateNested()
  periodRepeatFormat?: ClassRegularPeriodRepeatFormat

  @ApiPropertyOptional({
    example: { every: 1, unit: 'days' },
    description: 'Gap between period',
  })
  @IsOptional()
  @ValidateNested()
  gapBetweenPeriods?: ClassRegularPeriodRepeatFormat

  @ApiProperty({
    example: 3,
    description: 'Number of periods to repeat. Set to -1 for infinite repeat',
  })
  @IsNotEmpty()
  @IsInt()
  periodRepeatCount?: number

  @ApiProperty({
    enum: ClassRegularPeriodsSelectionMode,
    example: ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD,
  })
  @IsOptional()
  @IsEnum(ClassRegularPeriodsSelectionMode)
  selectionMode?: ClassRegularPeriodsSelectionMode

  @ApiPropertyOptional({
    type: [CreateOrUpdateClassRegularPeriodDto],
    description: 'Array of lesson periods within this schedule',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateClassRegularPeriodDto)
  periodsV2?: CreateOrUpdateClassRegularPeriodDto[]
}

export class CreateClassRegularScheduleRepeatFormatDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  every: number

  @ApiPropertyOptional({
    example: 'days',
    description: 'Gap between period',
  })
  @IsNotEmpty()
  @IsEnum(RepeatUnit)
  unit: RepeatUnit

  @ApiPropertyOptional({
    example: '2025-07-16T09:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startTime?: string
}

export class UpdateClassRegularScheduleDto {
  @ApiPropertyOptional({ example: 1, description: 'Period repeat format ID' })
  @IsOptional()
  @ValidateNested()
  periodRepeatFormat?: CreateClassRegularScheduleRepeatFormatDto

  @ApiPropertyOptional({
    example: { every: 1, unit: 'days' },
    description: 'Gap between period',
  })
  @IsOptional()
  @ValidateNested()
  gapBetweenPeriods?: CreateClassRegularScheduleRepeatFormatDto

  @ApiPropertyOptional({
    example: 3,
    description: 'Number of periods to repeat. Set to -1 for infinite repeat',
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  periodRepeatCount?: number

  @ApiPropertyOptional({
    type: [CreateOrUpdateClassRegularPeriodDto],
    description: 'Array of lesson periods within this schedule',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateClassRegularPeriodDto)
  periodsV2?: CreateOrUpdateClassRegularPeriodDto[]

  @ApiPropertyOptional({
    example: [
      {
        date: '2025-07-17',
        isAvailable: false,
      },
    ],
    description: 'Date overrides for skipping or adding custom dates',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateOverrideDto)
  dateOverrides?: DateOverrideDto[]

  @ApiPropertyOptional({
    enum: ClassRegularPeriodsSelectionMode,
    example: ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD,
  })
  @IsOptional()
  @IsEnum(ClassRegularPeriodsSelectionMode)
  selectionMode?: ClassRegularPeriodsSelectionMode
}

export class DateOverrideDto {
  @ApiProperty({ example: '2025-07-17' })
  @IsNotEmpty()
  @IsString()
  date: string

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean

  @ApiPropertyOptional({ example: '2025-07-17T03:30:00.000Z' })
  @IsOptional()
  @IsString()
  startTime?: string

  @ApiPropertyOptional({ example: '2025-07-17T04:00:00.000Z' })
  @IsOptional()
  @IsString()
  endTime?: string
}

export class ClassRegularSchedulePageOptionsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classId?: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  institutionId?: number
}

/**
+ * @deprecated Use CreateClassRegularScheduleDto instead. Will be removed in v2.0
+ */
export class CreateClassRegularPeriodsDto extends CreateClassRegularScheduleDto {}

/**
 * @deprecated Use UpdateClassRegularScheduleDto instead. Will be removed in v2.0
 */
export class UpdateClassRegularPeriodsDto extends UpdateClassRegularScheduleDto {}

/**
 * @deprecated Use ClassRegularSchedulePageOptionsDto instead. Will be removed in v2.0
 */
export class ClassRegularPeriodsPageOptionsDto extends ClassRegularSchedulePageOptionsDto {}
