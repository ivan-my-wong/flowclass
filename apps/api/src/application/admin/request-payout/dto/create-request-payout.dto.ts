import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreateRequestPayoutDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number
}
