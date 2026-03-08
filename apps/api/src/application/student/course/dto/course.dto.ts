import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'

import { ClassWithEnrolCountModel } from '@/application/admin/courses/dto/create-or-update-class.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { Course } from '@/models/courses.entity'

export class StudentGetAllCourseDTO extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  siteId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  institutionId: number
}

export class StudentGetSingleCourseDTO {
  @ApiProperty()
  @IsString()
  domain: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institutionUrl: string

  @ApiProperty()
  @IsString()
  courseUrl: string
}

export class StudentClassWithEnrolCountModel extends ClassWithEnrolCountModel {}

export class StudentGetSingleCourseResponseDto extends Course {
  @ApiProperty({ isArray: true, type: StudentClassWithEnrolCountModel })
  @ValidateNested({ each: true })
  @Type(() => StudentClassWithEnrolCountModel)
  classes: StudentClassWithEnrolCountModel[]
}

export class EmailVerificationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  courseId: number

  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email: string
}
