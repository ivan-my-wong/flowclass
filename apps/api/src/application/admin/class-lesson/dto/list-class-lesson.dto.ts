import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { SharedVideoStatus } from '@/models/enums/status'

export class ListClassLessonDto {
  @ApiProperty({ required: false, isArray: true, items: { type: 'number' }, type: Number })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value != 'object') value = Array(value)
    return value.map((item) => Number(item))
  })
  courseIds: number[]

  @ApiProperty({ required: false, isArray: true, items: { type: 'number' }, type: Number })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value != 'object') value = Array(value)
    return value.map((item) => Number(item))
  })
  classIds: number[]

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  startDate: Date

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  student?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value != 'boolean') value = false
    return value
  })
  onlyWithApplications?: boolean = false

  @ApiProperty({ required: false, isArray: true, items: { type: 'number' }, type: Number })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value != 'object') value = Array(value)
    return value.map((item) => Number(item))
  })
  locationIds: number[]

  @ApiProperty({ required: false, isArray: true, items: { type: 'number' }, type: Number })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value != 'object') value = Array(value)
    return value.map((item) => Number(item))
  })
  teacherIds: number[]
}

export class ListStudentsWithPage extends PageOptionsDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  withUnpaid?: boolean = false
}

export class CheckQuotaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  lessonIds: number[]

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  classId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeslots?: string[]
}

export class CheckQuotaResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quota: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lessonId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  remainingQuota: number

  @ApiProperty()
  @IsOptional()
  @IsArray()
  conflict?: any[]
}

export class BulkUpdateSharedVideoDto {
  @ApiProperty({ isArray: true, items: { type: 'number' }, type: Number })
  @IsArray()
  @IsNumber({}, { each: true })
  classLessonIds: number[]

  @ApiPropertyOptional({ isArray: true, items: { type: 'number' }, type: Number })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  studentLessonIds?: number[]

  @ApiProperty({ enum: SharedVideoStatus })
  @IsEnum(SharedVideoStatus)
  @IsNotEmpty()
  hasSharedVideo: SharedVideoStatus
}
