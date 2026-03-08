import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class GetListBlockTimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}
