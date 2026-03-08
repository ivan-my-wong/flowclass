import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { PayoutPreferenceDto } from '@/application/admin/request-payout/dto/receive-Payout-Preference.dto'

export class StudentCreatePaymentEvidenceDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  enrollId: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  invoiceId: string

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File

  @ApiProperty({
    example: PayoutPreferenceDto.example,
  })
  @IsOptional()
  payLaterMethod: string
}
