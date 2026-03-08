import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { IntegrationConnectStatus } from '@/models/enums/status'
@Exclude()
export class StudentStripConnectionResponse {
  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  stripeAccountId: string

  @ApiProperty()
  @Expose()
  status: IntegrationConnectStatus
}
