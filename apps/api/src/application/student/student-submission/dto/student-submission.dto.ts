import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class StudentMaterialsDto {
  @ApiProperty({
    example: '1',
    description: 'Class Lesson ID',
  })
  @IsNotEmpty()
  @IsString()
  studentLessonId: string

  @ApiProperty({
    example: '1',
    description: 'Student ID',
  })
  @IsNotEmpty()
  @IsString()
  studentId: string
}
