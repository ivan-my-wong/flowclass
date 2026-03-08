import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'

import {
  IPrerequisite,
  IPrerequisiteCondition,
  IPrerequisiteGroup,
  PrerequisiteOperator,
} from '@/models/custom-types/prerequisites'

export class PrerequisitesConditionDto implements IPrerequisiteCondition {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  @IsNotEmpty()
  courseId: number

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  @IsNotEmpty()
  classId: number

  @ApiProperty({ example: PrerequisiteOperator.AND, enum: PrerequisiteOperator, required: true })
  @IsString()
  @IsIn(['AND', 'OR'], { message: 'operator must be either AND or OR' })
  operator: PrerequisiteOperator
}

export class PrerequisitesGroupDto implements IPrerequisiteGroup {
  @ApiProperty({
    type: [PrerequisitesConditionDto],
    required: true,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PrerequisitesConditionDto)
  conditions: PrerequisitesConditionDto[]

  @ApiProperty({ example: PrerequisiteOperator.AND, enum: PrerequisiteOperator, required: true })
  @IsString()
  @IsIn(['AND', 'OR'], { message: 'group_operator must be either AND or OR' })
  groupOperator: PrerequisiteOperator
}

export class ValidatePrerequisitesDto implements IPrerequisite {
  @ApiProperty({
    type: [PrerequisitesGroupDto],
    required: true,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PrerequisitesGroupDto)
  groups: PrerequisitesGroupDto[]
}

export class CheckPrerequisitesConditionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  courseId: number

  @ApiProperty({ example: 'Jhon Doe' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'jhondoe@example' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ example: '+852 7788 9900' })
  @IsString()
  @IsNotEmpty()
  phone: string
}
