import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateIntegrationOnlineMeetingDto {
  @ApiProperty({
    description: 'Whether the online meeting connection is enabled',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean
}
