import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator'

export class RescheduleSettingsDto {
  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  selectCourse: boolean

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  selectClass: boolean

  @ApiProperty({
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  minimumHoursBeforeRequest: number
}
