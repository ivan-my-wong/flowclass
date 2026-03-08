import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { StudentEnrollCourseResponse } from './create-enroll-course.dto'

export class StudentEnrollCoursePageDto extends PageDto<StudentEnrollCourseResponse> {}

export class StudentEnrollCourseOptionDto extends PageOptionsDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  siteId?: number

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  institutionId?: number
}

export class StudentEnrollCourseDetailDto {
  @ApiProperty({
    example: 'JWT Token',
  })
  @IsString()
  @IsNotEmpty()
  token: string
}

export class StudentApplicantsAdditionalFeeDto {
  @ApiProperty({
    example: 'example@gmail.com',
  })
  @IsString()
  @IsOptional()
  email?: string

  @ApiProperty({
    example: '0987654321',
  })
  @IsString()
  @IsNotEmpty()
  phone: string
}

export class StudentGetAdditionalFeeDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  courseId: number

  @ApiProperty({
    example: [],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StudentApplicantsAdditionalFeeDto)
  applicants: StudentApplicantsAdditionalFeeDto[]
}

export class StudentCheckIsValidTrialLesson extends StudentGetAdditionalFeeDto {
  @ApiProperty({
    example: [1],
  })
  @IsArray()
  @IsNotEmpty()
  classIds: number[]
}

export class StudentGetEnrollCourseStudentLessonDto {
  @ApiProperty({
    example: '1,2,3',
  })
  @IsString()
  @IsNotEmpty()
  enrollIds: string
}
