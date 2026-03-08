import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { PaymentEvidenceStatus } from '@/models/enums/status'

@Exclude()
export class PaymentEvidenceDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  userId: number

  @ApiProperty()
  @Expose()
  enrollCourseId: number

  @ApiProperty()
  @Expose()
  invoiceId: number

  @ApiProperty()
  @Expose()
  image: string

  @ApiProperty()
  @Expose()
  status: PaymentEvidenceStatus
}

export class DeletePaymentEvidenceDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  userId: number

  @ApiProperty()
  @Expose()
  enrollCourseId: number

  @ApiProperty()
  @Expose()
  invoiceId: number
}
