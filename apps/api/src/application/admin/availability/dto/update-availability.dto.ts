import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { AvailableSchedules, DateOverride } from '@/models/availability.entity'

export class UpdateAvailabilityDto {
  @ApiProperty({
    default: [],
    example: [
      {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '17:00',
        isEnabled: true,
      },
    ],
  })
  @IsOptional()
  availableSchedules?: AvailableSchedules[]

  @ApiProperty({ example: 1 })
  @IsOptional()
  integrationCalendarId?: number

  @ApiProperty({
    default: [],
    example: [
      {
        date: '2023-03-17T00:00:00.000Z',
        isAvailable: true,
        startTime: '08:00',
        endTime: '17:00',
      },
    ],
  })
  @IsOptional()
  dateOverrides?: DateOverride[]

  @ApiProperty({ example: 1 })
  @IsOptional()
  assignedUserId?: number

  @ApiProperty({ example: 'name' })
  @IsOptional()
  name?: string
}
