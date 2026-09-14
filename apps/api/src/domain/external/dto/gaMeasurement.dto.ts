import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

import { GaMeasurementEventName } from '@/models/enums/'

export class GaMeasurementEvent {
  @ApiProperty({
    example: 'event_name',
  })
  @IsNotEmpty()
  @IsString()
  name: GaMeasurementEventName

  @IsObject()
  params: Record<string, any>
}

export class GaMeasurementRequestDto {
  @ApiProperty({
    example: '40030803.167153367',
  })
  clientId: string

  @ApiProperty({
    example: '12345',
  })
  @IsOptional()
  userId?: number

  @ApiProperty({
    example: [
      {
        name: 'tutorial_begin',
        params: {},
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => GaMeasurementEvent)
  events: GaMeasurementEvent[]

  @IsOptional()
  @IsObject()
  userProperties?: Record<string, any>
}
