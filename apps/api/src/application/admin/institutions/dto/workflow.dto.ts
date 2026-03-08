import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class TagDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsDateString()
  createdAt: string

  @ApiProperty()
  @IsDateString()
  updatedAt: string
}

export class IntervalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  field: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  daysInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  hoursInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  monthsInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minutesInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  weeksInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  secondsInterval?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  triggerAtHour?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  triggerAtMinute?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  triggerAtSecond?: number

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  triggerAtDay?: number[]

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  triggerAtDayOfMonth?: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  expression?: string
}

export class RuleDto {
  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IntervalDto)
  interval: IntervalDto[]
}

export class ParametersObjectDto {
  @ApiProperty()
  @IsObject()
  @IsOptional()
  additionalProperties?: Record<string, unknown>

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  width?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height?: number

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => RuleDto)
  rule?: RuleDto
}

export class ConnectionDto {
  @ApiProperty()
  @IsString()
  node: string

  @ApiProperty()
  @IsString()
  type: string

  @ApiProperty()
  @IsNumber()
  index: number
}

export class WorkflowSettingsDto {
  @ApiProperty()
  @IsBoolean()
  saveExecutionProgress: boolean

  @ApiProperty()
  @IsBoolean()
  saveManualExecutions: boolean

  @ApiProperty()
  @IsString()
  saveDataErrorExecution: string

  @ApiProperty()
  @IsString()
  saveDataSuccessExecution: string

  @ApiProperty()
  @IsNumber()
  executionTimeout: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  errorWorkflow?: string

  @ApiProperty()
  @IsString()
  timezone: string

  @ApiProperty()
  @IsString()
  executionOrder: string
}

export class CredentialDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  name: string
}

export class NodeDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  webhookId?: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  disabled?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  notesInFlow?: boolean

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty()
  @IsString()
  type: string

  @ApiProperty()
  @IsNumber()
  typeVersion: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  executeOnce?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  alwaysOutputData?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  retryOnFail?: boolean

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxTries?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  waitBetweenTries?: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  onError?: string

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  position?: number[]

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ParametersObjectDto)
  parameters?: ParametersObjectDto

  @ApiProperty()
  @IsObject()
  @IsOptional()
  credentials?: Record<string, CredentialDto>
}

export class ConnectionsObjectDto {
  @ApiProperty()
  @IsArray()
  @IsOptional()
  main: ConnectionDto[]
}

export class StaticDataDto {
  @ApiProperty()
  @IsNumber()
  lastId: number
}

export class WorkflowDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  active: boolean

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createdAt?: string

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  updatedAt?: string

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes: NodeDto[]

  @ApiProperty()
  @IsObject()
  @IsOptional()
  connections?: ConnectionsObjectDto

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowSettingsDto)
  @IsOptional()
  settings?: WorkflowSettingsDto

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => StaticDataDto)
  @IsOptional()
  staticData?: StaticDataDto

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  @IsOptional()
  tags?: TagDto[]
}
