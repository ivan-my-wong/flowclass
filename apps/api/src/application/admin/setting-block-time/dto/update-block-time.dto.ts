import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsNotEmpty } from 'class-validator'

export class UpdateBlockTimeDto {
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
