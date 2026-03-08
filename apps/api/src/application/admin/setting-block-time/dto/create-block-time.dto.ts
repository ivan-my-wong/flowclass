import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateBlockTimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  wholeDay: boolean

  @IsNotEmpty()
  @ApiProperty()
  @IsDate()
  startTime: Date

  @IsNotEmpty()
  @ApiProperty()
  @IsDate()
  endTime: Date
}
