import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator'

import { StripePriceInterval } from '@/models/enums/'

import { UpgradePlanRequestSinglePlan } from './upgrade-subscription-plans.dto'

export class PlanIntervalDto extends UpgradePlanRequestSinglePlan {
  @ApiProperty({ enum: StripePriceInterval })
  @IsEnum(StripePriceInterval)
  interval: StripePriceInterval
}

export class CreatePlanDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNumber()
  siteId: number

  @ApiProperty({ type: [PlanIntervalDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanIntervalDto)
  plans: PlanIntervalDto[]
}
