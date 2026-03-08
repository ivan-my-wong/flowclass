import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { EnrollConfirmStatus } from '@/models/enums/status'

import { EnrollCourseResponse } from './create-enroll-course.dto'

export class EnrollCoursePageDto extends PageDto<EnrollCourseResponse> {}

export class EnrollCourseOptionDto extends PageOptionsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  classId: number

  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId: number

  @ApiPropertyOptional({
    enum: EnrollConfirmStatus,
  })
  @IsEnum(EnrollConfirmStatus)
  @IsOptional()
  confirmState?: EnrollConfirmStatus
}
