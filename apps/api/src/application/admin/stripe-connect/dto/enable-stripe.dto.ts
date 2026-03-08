import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class EnableStripeDto {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  enabled: boolean
}
