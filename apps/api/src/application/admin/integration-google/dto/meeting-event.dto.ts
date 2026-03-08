import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsISO8601, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'

// Reusing the same structure as calendar events
export class EventTimeDto {
  @ApiProperty({
    description: 'The date and time in ISO 8601 format',
    example: '2025-04-24T10:00:00+08:00',
  })
  @IsNotEmpty()
  @IsISO8601()
  dateTime: string

  @ApiProperty({
    description: 'The timezone identifier',
    example: 'Asia/Singapore',
  })
  @IsNotEmpty()
  @IsString()
  timeZone: string
}

export class CreateMeetingEventDto {
  @ApiProperty({
    description: 'The summary/title of the meeting',
    example: 'Math Class',
  })
  @IsNotEmpty()
  @IsString()
  summary: string

  @ApiProperty({
    description: 'The description of the meeting',
    example: 'Weekly math class for Grade 5',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'The start time of the meeting',
    type: EventTimeDto,
  })
  @ValidateNested()
  @Type(() => EventTimeDto)
  @IsNotEmpty()
  start: EventTimeDto

  @ApiProperty({
    description: 'The end time of the meeting',
    type: EventTimeDto,
  })
  @ValidateNested()
  @Type(() => EventTimeDto)
  @IsNotEmpty()
  end: EventTimeDto
}

export class UpdateMeetingEventDto {
  @ApiProperty({
    description: 'The summary/title of the meeting',
    example: 'Math Class',
    required: false,
  })
  @IsOptional()
  @IsString()
  summary?: string

  @ApiProperty({
    description: 'The description of the meeting',
    example: 'Weekly math class for Grade 5',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'The start time of the meeting',
    type: EventTimeDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => EventTimeDto)
  @IsOptional()
  start?: EventTimeDto

  @ApiProperty({
    description: 'The end time of the meeting',
    type: EventTimeDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => EventTimeDto)
  @IsOptional()
  end?: EventTimeDto
}
