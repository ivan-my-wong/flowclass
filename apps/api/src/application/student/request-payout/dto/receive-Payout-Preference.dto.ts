import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { PayoutMethodName } from '@/models/enums/'
// Create a base interface
export class StudentPayoutPreferenceDto {
  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id?: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 'some thing',
  })
  @IsString()
  description?: string

  @ApiProperty({
    // example: PayoutMethodName.PAY_ME,
    examples: [PayoutMethodName.BANK_TRANSFER, PayoutMethodName.OTHERS],
  })
  @IsNotEmpty()
  @IsString()
  methodType: PayoutMethodName

  @ApiProperty({
    // example: PayoutMethodName.PAY_ME,
    examples: ['HSBC', 'Standard Chartered', 'Alipay', 'WeChatPay'],
  })
  @IsNotEmpty()
  @IsString()
  methodName: string

  @ApiProperty({
    example: {
      bankTransfer: {
        accountName: 'Peter',
        bankName: 'HSBC',
        bankBranch: 'HSBC',
        accountNumber: '1234567890',
      },
      payme: {
        accountName: '1234567890',
        payoutDetails: 'payout details: (payment ID or account number)',
        payoutImg: 'http://abcd.com/image_url_Optional',
        payoutUrl: 'http://abcd.com/payment_link_Optional',
      },
      swift: {
        accountName: '1234567890',
        payoutDetails: 'payout details: (payment ID or account number)',
        payoutImg: 'http://abcd.com/url_Optional',
        payoutUrl: 'http://abcd.com/payment_link_Optional',
      },
      Others: {
        accountName: 'Peter',
        payoutDetails: 'payout details: (payment ID or account number)',
        payoutImg: 'http://abcd.com/url_Optional',
        payoutUrl: 'http://abcd.com/payment_link_Optional',
      },
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsNotEmpty()
  payoutMethodDetails: Record<string, any>

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  enabled = false
}

export class StudentGetPayoutPreferenceDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true'
  })
  getEnabledOnly: boolean
}
