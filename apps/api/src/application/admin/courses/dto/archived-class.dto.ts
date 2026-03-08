import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class ClassArchiveActionDTO {
  @ApiProperty({
    example: 1,
    description: 'Class ID to archive/unarchive',
  })
  @Min(1)
  @IsInt()
  classId: number
}
