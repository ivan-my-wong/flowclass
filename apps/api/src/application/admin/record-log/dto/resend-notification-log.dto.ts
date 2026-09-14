import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator'

export class ResendNotificationLogDto {
  @ApiProperty({
    description: 'Array of notification record IDs to resend',
    type: [Number],
    example: [123, 456],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  recordIds: number[]
}
