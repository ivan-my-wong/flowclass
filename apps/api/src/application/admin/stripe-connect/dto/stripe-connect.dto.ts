import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class StripeWebhookResponse {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  received: boolean
}
