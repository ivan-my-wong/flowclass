import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class SubscribePresetPlansDto {
  @ApiProperty({ description: 'Preset Plan ID', required: true })
  @IsNumber()
  presetPlanId: number

  @ApiProperty({ description: 'Price ID', required: true })
  @IsString()
  priceId: string

  @ApiProperty({ description: 'Site ID', required: true })
  @IsNumber()
  siteId: number

  @ApiProperty({ description: 'Institution ID', required: true })
  @IsNumber()
  institutionId: number
}
