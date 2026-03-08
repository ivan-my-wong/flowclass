import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { LocationRoom } from '@/models/location-room.entity'
import { StudentLesson } from '@/models/student-lesson.entity'

export class InstructorDataDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the instructor',
  })
  @IsNumber()
  @IsNotEmpty()
  instructorId: number

  @ApiProperty({
    example: new Date('2025-01-01'),
    description: 'The scheduled date of the class',
  })
  @IsDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({
    example: new Date('2025-01-01'),
    description: 'The scheduled date of the class',
  })
  @IsDate()
  @IsOptional()
  endDate?: Date

  @ApiProperty({
    example: 1,
    description: 'The ID of the institution',
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    example: 1,
    description: 'The ID of the site',
  })
  @IsNumber()
  @IsNotEmpty()
  siteId: number

  @ApiProperty({
    example: [1, 2, 3],
    description: 'The IDs of the courses',
  })
  @IsArray()
  @IsOptional()
  courseIds?: number[]

  @ApiProperty({
    example: [1, 2, 3],
    description: 'The IDs of the classes',
  })
  @IsArray()
  @IsOptional()
  classIds?: number[]

  @ApiProperty({
    example: [1, 2, 3],
    description: 'The IDs of the locations',
  })
  @IsArray()
  @IsOptional()
  locationIds?: number[]
}

export class InstructorAnalyticsResponse {
  numberOfLessons: number
  numberOfStudents: number
  totalSalary?: number
  totalHours?: number
}

export type InstructorClassLessonListResponse = {
  institutionId: number
  courseId: number
  instructorId: number
  startTime: Date
  endTime: Date
  course: {
    id: number
    name: string
  }
  class: {
    id: number
    name: string
    type: string
  }
  locationRoom?: LocationRoom

  studentLessons: StudentLesson[]
  numberOfStudents: number // Changed from studentsCount

  hourlyRate?: number // New field for frontend
  finalHourlySalary?: number // final hourly salary(with student rates)
  duration?: number // New field for duration in hours
  lessonSalary?: number // Total amount based on hourly rate

  // totalRevenue: number
  isPast: boolean // For status determination
}
