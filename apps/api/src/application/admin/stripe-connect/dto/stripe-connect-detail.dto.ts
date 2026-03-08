import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { IntegrationConnectStatus } from '@/models/enums/status'

@Exclude()
export class StripeConnectDetailDto {
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiPropertyOptional()
  @Expose()
  institutionId: number

  @ApiPropertyOptional()
  @Expose()
  stripeAccountId: string

  @ApiPropertyOptional()
  @Expose()
  status?: IntegrationConnectStatus

  @ApiPropertyOptional()
  @Expose()
  customerId: string

  @ApiPropertyOptional()
  @Expose()
  subscriptionId: string
}
