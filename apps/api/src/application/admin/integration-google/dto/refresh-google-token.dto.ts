import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class RefreshGoogleMeetTokenDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    description: 'Integration online meeting ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationOnlineMeetingId: number
}
