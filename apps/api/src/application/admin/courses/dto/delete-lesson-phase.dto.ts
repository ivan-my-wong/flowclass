import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty } from 'class-validator'

export class DeleteLessonPhaseDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  lessonId: number

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  classId: number
}
