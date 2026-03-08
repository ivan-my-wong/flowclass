import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class StripeProductsDetailReponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  stripeProductId: string

  @ApiProperty()
  @Expose()
  name: string

  @ApiProperty()
  @Expose()
  description: string

  @ApiProperty()
  @Expose()
  metadata: Record<string, string>

  @ApiProperty()
  @Expose()
  active: boolean
}
