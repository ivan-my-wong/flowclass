import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString } from 'class-validator'

export class CreateAvailabilityDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  siteId: number

  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number

  @ApiProperty({
    example: 'Test Availability',
  })
  @IsString()
  name: string
}
