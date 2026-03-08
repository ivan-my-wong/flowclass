import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

// =============================================================================
// BASE DTOs
// =============================================================================

/**
 * Base query for statistics with required date range
 */
export class BaseStatisticsQueryDto {
  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-03-01',
  })
  @IsDateString()
  start: string

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-04-01',
  })
  @IsDateString()
  end: string

  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  institutionId: number

  @ApiProperty({
    description: 'Site ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  siteId: number
}

/**
 * Filter options for statistics
 */
export class StatisticsFilterDto extends BaseStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by course ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  courseId?: number

  @ApiPropertyOptional({
    description: 'Filter by class ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  classId?: number

  @ApiPropertyOptional({
    description: 'Filter by instructor ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  instructorId?: number
}

// =============================================================================
// DASHBOARD DTOs
// =============================================================================

export enum DashboardType {
  REVENUE = 'revenue',
  STUDENT = 'student',
}

export enum RevenueFilter {
  OVERVIEW = 'overview',
  BY_COURSE = 'by-course',
  BY_CLASS = 'by-class',
  BY_INSTRUCTOR = 'by-instructor',
}

export enum StudentFilter {
  OVERVIEW = 'overview',
  BY_STUDENT = 'by-student',
  BY_INSTRUCTOR = 'by-instructor',
}

/**
 * Dashboard statistics query
 *
 * Supports two types of statistics:
 * 1. Revenue: overview, by-course, by-class, by-instructor
 * 2. Student: overview, by-student, by-instructor
 */
export class DashboardStatisticsDto extends StatisticsFilterDto {
  @ApiProperty({
    description: 'Type of statistics',
    enum: DashboardType,
    example: DashboardType.REVENUE,
  })
  @IsEnum(DashboardType)
  type: DashboardType

  @ApiProperty({
    description: 'Filter/grouping for statistics',
    example: 'overview',
  })
  @IsString()
  filter: string

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    example: 'PAID',
  })
  @IsString()
  @IsOptional()
  status?: string
}

// =============================================================================
// LESSON DTOs
// =============================================================================

/**
 * Query for lesson list with pagination
 */
export class LessonListQueryDto extends StatisticsFilterDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({
    description: 'Search by student name (partial match)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  studentName?: string

  @ApiPropertyOptional({
    description: 'Filter by specific lesson ID',
    example: 123,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  lessonId?: number

  @ApiPropertyOptional({
    description: 'Search by lesson name (partial match)',
    example: 'Math',
  })
  @IsString()
  @IsOptional()
  lessonName?: string

  @ApiProperty({
    description: 'Start date for filtering lessons',
    example: '2025-03-01',
  })
  @IsDateString()
  startDate: string

  @ApiProperty({
    description: 'End date for filtering lessons',
    example: '2025-04-01',
  })
  @IsDateString()
  endDate: string
}

/**
 * Query for single lesson detail
 */
export class LessonDetailQueryDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  institutionId: number

  @ApiProperty({
    description: 'Site ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  siteId: number
}

/**
 * Response for lesson list item
 */
export class LessonListItemDto {
  @ApiProperty({ description: 'Lesson ID', example: 123 })
  id: number

  @ApiProperty({ description: 'Lesson date', example: '2025-03-15T10:00:00Z' })
  date: string

  @ApiProperty({ description: 'Lesson time', example: '10:00 - 11:00' })
  time: string

  @ApiProperty({ description: 'Course name', example: 'Mathematics' })
  course: string

  @ApiProperty({ description: 'Class name', example: 'Class A' })
  class: string

  @ApiProperty({ description: 'Lesson identifier', example: 'Lesson 123' })
  lesson: string

  @ApiProperty({ description: 'Teacher name(s)', example: 'John Doe' })
  teachers: string

  @ApiProperty({ description: 'Number of students', example: 15 })
  students: number

  @ApiProperty({ description: 'Lesson status', example: 'COMPLETED' })
  status: string

  @ApiProperty({ description: 'Total revenue from lesson', example: 1500.5 })
  totalRevenue: number
}

/**
 * Student payment breakdown for a lesson
 */
export class StudentPaymentDto {
  @ApiProperty({ description: 'Student ID', example: 1 })
  studentId: number

  @ApiProperty({ description: 'Student name', example: 'Jane Smith' })
  name: string

  @ApiProperty({ description: 'Student phone', example: '+1234567890' })
  phone: string

  @ApiProperty({
    description: 'Total lesson value (pay_amount / num_of_lesson)',
    example: 100.0,
  })
  totalLessonValue: number

  @ApiProperty({
    description: 'Credit applied (used_balance / num_of_lesson)',
    example: 20.0,
  })
  creditApplied: number

  @ApiProperty({
    description: 'Net payment (total - credit)',
    example: 80.0,
  })
  netPayment: number

  @ApiProperty({ description: 'Payment status', example: 'PAID' })
  paymentStatus: string

  @ApiProperty({ description: 'Attendance status', example: 'ATTENDED' })
  attendanceStatus: string
}

/**
 * Response for lesson detail
 */
export class LessonDetailDto {
  @ApiProperty({ type: LessonListItemDto })
  lesson: LessonListItemDto

  @ApiProperty({ type: [StudentPaymentDto] })
  studentPayments: StudentPaymentDto[]
}

// =============================================================================
// STUDENT DTOs
// =============================================================================

/**
 * Query for student statistics
 */
export class StudentStatisticsDto extends StatisticsFilterDto {
  @ApiPropertyOptional({
    description: 'Search by student name (partial match)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  studentName?: string

  @ApiPropertyOptional({
    description: 'Filter by teacher/instructor ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  teacherId?: number
}

/**
 * Query for student course details
 */
export class StudentCourseDetailsQueryDto extends BaseStatisticsQueryDto {}

/**
 * Query for student by student breakdown
 */
export class StudentByStudentQueryDto extends StudentStatisticsDto {}

/**
 * Query for dropout students in a class
 */
export class DropoutStudentsQueryDto extends BaseStatisticsQueryDto {}

/**
 * Response for student overview summary
 */
export class StudentOverviewSummaryDto {
  @ApiProperty({ description: 'Number of active students', example: 120 })
  activeStudents: number

  @ApiProperty({ description: 'Number of new students this month', example: 15 })
  newStudentsThisMonth: number

  @ApiProperty({ description: 'Total number of dropouts', example: 8 })
  totalDropouts: number

  @ApiProperty({ description: 'Dropout rate percentage', example: 6.67 })
  dropoutRate: number
}

/**
 * Response for class dropout statistics
 */
export class ClassDropoutStatsDto {
  @ApiProperty({ description: 'Class ID', example: 1 })
  classId: number

  @ApiProperty({ description: 'Course name', example: 'Mathematics' })
  courseName: string

  @ApiProperty({ description: 'Class name', example: 'Class A' })
  className: string

  @ApiProperty({ description: 'Teacher name', example: 'John Doe' })
  teacherName: string

  @ApiProperty({ description: 'Total students in class', example: 25 })
  totalStudents: number

  @ApiProperty({ description: 'New students this month', example: 3 })
  newStudents: number

  @ApiProperty({ description: 'Number of dropouts', example: 2 })
  dropouts: number

  @ApiProperty({ description: 'Dropout rate percentage', example: 8.0 })
  dropoutRate: number
}

/**
 * Response for student detail
 */
export class StudentDetailDto {
  @ApiProperty({ description: 'Student ID', example: 1 })
  studentId: number

  @ApiProperty({ description: 'Student name', example: 'Jane Smith' })
  studentName: string

  @ApiProperty({ description: 'Student phone', example: '+1234567890' })
  phone: string

  @ApiProperty({ description: 'Student email', example: 'jane@example.com' })
  email: string

  @ApiProperty({ description: 'Number of current courses', example: 3 })
  numberOfCourses: number

  @ApiProperty({ description: 'Number of new courses this month', example: 1 })
  newCourses: number

  @ApiProperty({ description: 'Number of courses dropped', example: 0 })
  coursesDroppedOut: number

  @ApiProperty({ description: 'Has totally dropped out?', example: 'No' })
  totallyDroppedOut: 'Yes' | 'No'
}

/**
 * Response for student course info
 */
export class StudentCourseInfoDto {
  @ApiProperty({ description: 'Course name', example: 'Mathematics' })
  courseName: string

  @ApiProperty({ description: 'Class name', example: 'Class A' })
  class: string

  @ApiProperty({ description: 'Instructor name', example: 'John Doe' })
  instructor: string

  @ApiProperty({
    description: 'Last attendance date',
    example: '2025-03-25T10:00:00Z',
    nullable: true,
  })
  lastAttendance: string | null
}

/**
 * Response for dropout student info
 */
export class DropoutStudentDto {
  @ApiProperty({ description: 'Student name', example: 'John Doe' })
  name: string

  @ApiProperty({ description: 'Student phone', example: '+1234567890' })
  phone: string

  @ApiProperty({ description: 'Student email', example: 'john@example.com' })
  email: string

  @ApiProperty({
    description: 'Last attendance date',
    example: '2025-02-15T10:00:00Z',
    nullable: true,
  })
  lastAttendance: string | null
}

// =============================================================================
// REVENUE DTOs
// =============================================================================

/**
 * Response for revenue overview
 */
export class RevenueOverviewDto {
  @ApiProperty({ description: 'Total revenue', example: 45250.0 })
  totalRevenue: number

  @ApiProperty({ description: 'Number of completed lessons', example: 28 })
  completedLessons: number

  @ApiProperty({ description: 'Number of active students', example: 120 })
  activeStudents: number
}

/**
 * Response for grouped revenue (by course/class/instructor)
 */
export class RevenueGroupedItemDto {
  @ApiProperty({ description: 'Entity ID', example: 1 })
  id: number

  @ApiProperty({ description: 'Entity name', example: 'Mathematics' })
  name: string

  @ApiProperty({ description: 'Total revenue', example: 15000.0 })
  totalRevenue: number

  @ApiProperty({ description: 'Number of lessons', example: 10 })
  lessons: number

  @ApiProperty({ description: 'Number of students', example: 25 })
  students: number
}

// =============================================================================
// PAGINATION DTOs
// =============================================================================

/**
 * Pagination metadata
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number

  @ApiProperty({ description: 'Total items', example: 100 })
  total: number

  @ApiProperty({ description: 'Total pages', example: 5 })
  totalPages: number
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Data items' })
  data: T[]

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto
}

// =============================================================================
// RESPONSE INTERFACES (for service return types)
// =============================================================================

export interface DashboardParams {
  type: 'revenue' | 'student'
  filter: string
  startDate: Date
  endDate: Date
  institutionId: number
  siteId: number
  courseId?: number
  classId?: number
  instructorId?: number
  status?: string
}

export interface LessonDetailParams {
  lessonId: number
  institutionId: number
  siteId: number
}
