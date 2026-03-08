import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateIntegrationCalendarDto {
  @ApiProperty({
    example: 'Calendar ID',
  })
  @IsOptional()
  @IsString()
  calendarId?: string

  @ApiProperty({
    example: 'Google Calendar',
  })
  @IsOptional()
  @IsString()
  calendarName?: string

  @ApiProperty({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}
