import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class AssignSiteManagerDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  assignedUserId: number
}
