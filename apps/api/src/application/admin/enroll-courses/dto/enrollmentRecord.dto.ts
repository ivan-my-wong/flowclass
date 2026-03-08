import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class EnrollmentRecordDTO {
  @ApiPropertyOptional({
    example: 'peterChan@gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({
    example: '+852 7788 9900',
  })
  @IsNotEmpty()
  @IsString()
  phone: string

  @ApiProperty({
    example: 'Peter Chan',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number
}

export class EnrolledClassCountDTO {
  @ApiProperty({
    example: 1,
  })
  classId: number
  @ApiProperty({
    example: 1,
  })
  classQuota: number
}
