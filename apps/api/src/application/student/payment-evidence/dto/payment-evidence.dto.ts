import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

import { PaymentEvidenceStatus } from '@/models/enums/status'

@Exclude()
export class StudentPaymentEvidenceDto {
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

  @ApiPropertyOptional()
  @Expose()
  createdAt: string
}
