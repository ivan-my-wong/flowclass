import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCourseEmailSettingsDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  courseId?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  institutionId?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  siteId?: number

  @IsOptional()
  @IsString()
  emailTitle?: string

  @IsOptional()
  @IsString()
  emailId?: string
}
