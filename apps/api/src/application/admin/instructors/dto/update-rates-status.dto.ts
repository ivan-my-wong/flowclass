import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

export class StudentRatesConfigDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minimumStudents: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  additionalSalaryPerStudent: number
}

export class UpdateRatesStatusDto {
  @IsBoolean()
  @IsOptional()
  isInstructorRatesEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  isStudentRatesEnabled?: boolean

  @ValidateIf((o) => o.isStudentRatesEnabled === true)
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentRatesConfigDto)
  studentRatesConfig?: StudentRatesConfigDto
}
