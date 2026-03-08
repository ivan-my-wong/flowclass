import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

import { FieldStatus, FieldType } from '@/models/common-field.entity'

export class EnrollmentFormBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class EnrollmentFormBaseDtoV2 extends EnrollmentFormBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number
}

export class IDDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number
}

export class CreateFieldDto extends EnrollmentFormBaseDto {
  @ApiProperty({
    example: 'ABC',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  question: string

  @ApiProperty({
    example: 'ABC',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string

  @ApiProperty({
    default: FieldType.SHORT_ANSWER,
    enum: FieldType,
    type: 'enum',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(FieldType)
  type: FieldType

  @ApiProperty({
    example: ['ABC'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  option: string[]

  @ApiProperty({
    example: true,
    required: true,
  })
  @IsBoolean()
  isRequire: boolean
}

export class UpdateFieldDto extends CreateFieldDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  fieldId: number
}

export class ChangeFieldStatusDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  fieldId: number

  @ApiProperty({
    default: FieldStatus.ACTIVE,
    enum: FieldStatus,
    type: 'enum',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(FieldStatus)
  status: FieldStatus
}

export class CreateFormDto extends EnrollmentFormBaseDto {
  @ApiProperty({
    example: 'ABC',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({
    example: 'ABC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description: string

  @ApiProperty({
    example: [1],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  // @IsNumber({}, { each: true })
  fields: string[]

  @ApiProperty({
    example: [1],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courses: number[] = []
}

export class UpdateFormDto extends CreateFormDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  formId: number
}

export class ReOrderDto extends EnrollmentFormBaseDto {
  @ApiProperty({
    example: [1, 2, 4, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  order: number[]
}

export class AssignFormForCourseDto extends EnrollmentFormBaseDto {
  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'Form ID to assign, or null to unassign',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  formId: number | null

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number
}

export class FormDetailDto extends IDDto {
  @ApiProperty({
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isDefault: boolean
}
