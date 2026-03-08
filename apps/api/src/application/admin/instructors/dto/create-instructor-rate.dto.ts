import { IsArray, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator'

export class CreateInstructorRateDto {
  @IsNumber()
  @IsOptional()
  courseId?: number

  @IsArray()
  @IsOptional()
  classIds?: number[]

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate: number

  @IsBoolean()
  @IsOptional()
  isDefaultRate?: boolean
}
