import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class LessonPreviewDto {
  @ApiProperty({ description: 'Lesson ID' })
  id: number

  @ApiProperty({ description: 'Start time in ISO format' })
  startTime: string

  @ApiProperty({ description: 'End time in ISO format' })
  endTime: string

  @ApiProperty({ description: 'Lesson number' })
  lessonNumber?: number

  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  date?: string

  @ApiProperty({ description: 'Period ID if applicable' })
  period?: number

  @ApiProperty({ description: 'Is lesson blocked' })
  isBlocked?: boolean

  @ApiProperty({ description: 'Is lesson override' })
  isOverride?: boolean
}

export class InstructorDto {
  @ApiProperty({ description: 'Instructor ID' })
  id: number

  @ApiProperty({ description: 'Instructor full name' })
  fullName: string

  @ApiProperty({ description: 'Instructor email' })
  email: string
}

export class LocationRoomDto {
  @ApiProperty({ description: 'Location room ID' })
  id: number

  @ApiProperty({ description: 'Location room name' })
  name: string
}

export class ClassWithLessonsDto {
  @ApiProperty({ description: 'Class ID' })
  classId: number

  @ApiProperty({ description: 'Class name' })
  className: string

  @ApiProperty({ description: 'Course ID' })
  courseId: number

  @ApiProperty({ description: 'Course name' })
  courseName: string

  @ApiProperty({ description: 'Class type (regularV2, recurring, workshop, appointment)' })
  type: string

  @ApiProperty({ description: 'Color for this class (for UI differentiation)' })
  color: string

  @ApiProperty({ description: 'Instructor information', type: InstructorDto, required: false })
  @Type(() => InstructorDto)
  instructor?: InstructorDto

  @ApiProperty({ description: 'Location room information', type: LocationRoomDto, required: false })
  @Type(() => LocationRoomDto)
  locationRoom?: LocationRoomDto

  @ApiProperty({ description: 'Array of lesson previews', type: [LessonPreviewDto] })
  @Type(() => LessonPreviewDto)
  lessons: LessonPreviewDto[]
}

export class AllClassesLessonsResponseDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: number

  @ApiProperty({ description: 'Course name' })
  courseName: string

  @ApiProperty({ description: 'Array of classes with their lessons', type: [ClassWithLessonsDto] })
  @Type(() => ClassWithLessonsDto)
  classes: ClassWithLessonsDto[]
}
