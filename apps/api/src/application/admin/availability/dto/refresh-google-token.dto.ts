import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class RefreshGoogleTokenDto {
  @ApiProperty({
    description: 'Integration calendar ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationCalendarId: number

  @ApiProperty({
    description: 'Integration ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationId: number

  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  institutionId: number
}
