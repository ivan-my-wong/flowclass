import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { PaymentEvidenceDto } from './payment-evidence.dto'

export class PaymentEvidencePageDto extends PageDto<PaymentEvidenceDto> {}

export class PaymentEvidencePageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsInt()
  siteId: number

  @ApiProperty()
  @IsInt()
  institutionId: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  userId?: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  invoiceId?: number
}
