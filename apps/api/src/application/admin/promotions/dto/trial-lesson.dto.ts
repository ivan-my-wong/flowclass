import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { ClassTrialLesson } from '@/models/trial-lesson.entity'

export type ValidClassTrialLessonResult = {
  isValid: boolean
  classTrialLesson: ClassTrialLesson | null
}

export class TrialLessonsPageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsNotEmpty()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  institutionId: number
}

export class ClassTrialLessons {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  classId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  price: number
}

export class TrialLessonObject {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  useOriginalPrice: boolean

  @ApiProperty()
  @Expose()
  price: number

  @ApiProperty()
  @Expose()
  classes: ClassTrialLessons[]

  @ApiProperty()
  @Expose()
  courseIds: number[]
}

export class TrialLessonClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  classId: number
}

export class TrialLessonDto {
  @ApiProperty()
  @Expose()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @Expose()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @Expose()
  @IsBoolean()
  useOriginalPrice: boolean

  @ApiProperty()
  @Expose()
  @IsBoolean()
  enabled: boolean

  @ApiProperty()
  @Expose()
  @IsNumber()
  price: number

  @ApiProperty({
    type: Array,
    required: true,
    example: [1, 2, 3],
  })
  @Expose()
  @IsArray()
  courseIds: number[]

  @ApiProperty({
    type: Array.of(TrialLessonClassDto),
    required: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TrialLessonClassDto)
  classes: TrialLessonClassDto[]
}
