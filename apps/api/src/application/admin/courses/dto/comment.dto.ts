import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'

export class CommentPageOptionDTO extends PageOptionsDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class PostCommentDTO {
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

export class CreateCommentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  userId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string
}

export class DeleteCommentDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  commentId: number
}
