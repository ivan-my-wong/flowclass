import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { StripePlanPriceLookupKey, StripePriceInterval } from '@/models/enums/'

@Exclude()
export class getAllPlanPricesReponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  unitAmount: number

  @ApiProperty()
  @Expose()
  currency: string

  @ApiProperty()
  @Expose()
  interval: StripePriceInterval

  @ApiProperty()
  @Expose()
  intervalCount: number

  @ApiProperty()
  @Expose()
  lookupKey: StripePlanPriceLookupKey

  @ApiProperty()
  @Expose()
  active: boolean
}
