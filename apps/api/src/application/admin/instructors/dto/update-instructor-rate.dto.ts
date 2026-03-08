import { IsArray, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, Min } from 'class-validator'

export class UpdateInstructorRateDto {
  @IsNumber()
  @IsOptional()
  id?: number

  @IsNumber()
  @IsOptional()
  courseId?: number

  @IsArray()
  @IsOptional()
  classIds?: number[]

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  hourlyRate?: number

  @IsBoolean()
  @IsOptional()
  isDefaultRate?: boolean

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsDate()
  @IsOptional()
  effectiveUntil?: Date

  @IsInt()
  @Min(0)
  @IsOptional()
  minimumStudents?: number | null

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  additionalSalaryPerStudent?: number | null
}
