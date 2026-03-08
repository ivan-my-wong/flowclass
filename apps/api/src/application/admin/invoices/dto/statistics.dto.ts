import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class DashboardStatisticsDto {
  @ApiProperty({ enum: ['revenue', 'student'], example: 'revenue' })
  @IsEnum(['revenue', 'student'])
  type: 'revenue' | 'student'

  @ApiProperty({
    enum: ['overview', 'by-course', 'by-class', 'by-instructor', 'by-student'],
    example: 'overview',
  })
  @IsEnum(['overview', 'by-course', 'by-class', 'by-instructor', 'by-student'])
  filter: 'overview' | 'by-course' | 'by-class' | 'by-instructor' | 'by-student'

  @ApiProperty({ example: '2025-03-01' })
  @IsDateString()
  start: string

  @ApiProperty({ example: '2025-04-01' })
  @IsDateString()
  end: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNumber()
  siteId: number

  @IsOptional()
  @IsString()
  status?: string
}

export interface DashboardParams {
  type: 'revenue' | 'student'
  filter: 'overview' | 'by-course' | 'by-class' | 'by-instructor' | 'by-student'
  startDate: Date
  endDate: Date
  institutionId: number
  siteId: number
  status?: string
  courseId?: number
  classId?: number
  instructorId?: number
  studentName?: string
  className?: string
}

export interface LessonDetailParams {
  lessonId: number
  institutionId: number
  siteId: number
}

export class StudentStatisticsDto {
  @IsOptional()
  @IsInt()
  institutionId?: number

  @IsOptional()
  @IsInt()
  siteId?: number

  @IsString()
  start: string // "2025-03-01"

  @IsString()
  end: string // "2025-04-01"

  @IsOptional()
  @IsString()
  studentName?: string

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classId?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  teacherId?: number
}

export class LessonListQueryDto {
  @IsString()
  @IsDateString()
  startDate: string

  @IsString()
  @IsDateString()
  endDate: string

  @ApiProperty({ required: false, example: 'paid' })
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  instructorId?: number

  @IsOptional()
  @IsString()
  studentName?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lessonId?: number

  @IsOptional()
  @IsString()
  lessonName?: string

  @IsInt()
  @Type(() => Number)
  siteId: number

  @IsInt()
  @Type(() => Number)
  institutionId: number
}

export class DropoutStudentsDto {
  @IsInt()
  @IsNotEmpty()
  classId: number

  @IsDateString()
  @IsNotEmpty()
  start: string

  @IsDateString()
  @IsNotEmpty()
  end: string

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  institutionId: number

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  siteId: number
}

export class StudentByStudentQueryDto {
  @IsDateString()
  start: string

  @IsDateString()
  end: string

  @IsInt()
  @Min(1)
  @Type(() => Number)
  institutionId: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  siteId: number

  @IsOptional()
  @IsString()
  studentName?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacherId?: number
}

export class DropoutStudentsQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  classId: number

  @IsDateString()
  start: string

  @IsDateString()
  end: string

  @IsInt()
  @Min(1)
  @Type(() => Number)
  institutionId: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  siteId: number
}

export class LessonDetailQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  siteId: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  institutionId: number
}

export class StudentCourseDetailsQueryDto {
  @IsDateString()
  start: string

  @IsDateString()
  end: string

  @IsInt()
  @Min(1)
  @Type(() => Number)
  institutionId: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  siteId: number
}
