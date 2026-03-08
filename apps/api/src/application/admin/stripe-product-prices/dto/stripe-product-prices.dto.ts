import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { StripePlanPriceLookupKey, StripePriceInterval, StripePriceType } from '@/models/enums/'

@Exclude()
export class StripeProductPricesDetailReponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  stripePriceId: string

  @ApiProperty()
  @Expose()
  stripeProductId: number

  @ApiProperty()
  @Expose()
  unitAmount: number

  @ApiProperty()
  @Expose()
  currency: string

  @ApiProperty()
  @Expose()
  metadata: Record<string, string>

  @ApiProperty()
  @Expose()
  type: StripePriceType

  @ApiProperty()
  @Expose()
  interval: StripePriceInterval

  @ApiProperty()
  @Expose()
  intervalCount: number

  @ApiProperty()
  @Expose()
  active: boolean

  @ApiProperty()
  @Expose()
  lookupKey: StripePlanPriceLookupKey
}
