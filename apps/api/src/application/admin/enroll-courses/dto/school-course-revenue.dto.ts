import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class SchoolCourseRevenueDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  courseId: number

  @ApiPropertyOptional({
    example: '2024-02-20',
  })
  @IsOptional()
  @IsString()
  startDate: string

  @ApiPropertyOptional({
    example: '2024-02-21',
  })
  @IsOptional()
  @IsString()
  endDate: string
}
