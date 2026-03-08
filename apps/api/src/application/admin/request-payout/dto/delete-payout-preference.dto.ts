import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class DeletePayoutPreferenceDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number

  @ApiProperty({
    example: 23,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 54,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}
