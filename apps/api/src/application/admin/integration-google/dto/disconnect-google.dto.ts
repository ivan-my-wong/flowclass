import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

import { GoogleServiceType } from '@/models/integration-google.entity'

export class DisconnectGoogleDto {
  @ApiProperty({
    description: 'The type of Google service to disconnect.',
    enum: GoogleServiceType,
    example: GoogleServiceType.SHEETS,
  })
  @IsEnum(GoogleServiceType)
  serviceType: GoogleServiceType
}
