import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString } from 'class-validator'

export class CreateIntegrationCalendarDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number

  @ApiProperty({
    example: 'xxxxxxxx',
  })
  @IsString()
  accessToken: string
}
