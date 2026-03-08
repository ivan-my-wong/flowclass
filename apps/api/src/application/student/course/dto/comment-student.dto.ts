import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'

export class StudentCommentPageOptionDTO extends PageOptionsDto {
  siteId: number
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class StudentPostCommentDTO {
  userId: number
  siteId: number
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty({ example: 'This course is so good' })
  @IsNotEmpty()
  @IsString()
  content: string
}
