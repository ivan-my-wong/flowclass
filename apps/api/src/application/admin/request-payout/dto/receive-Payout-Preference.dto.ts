import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { PayoutMethodName } from '@/models/enums/'
// Create a base interface
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBasePayoutDetails {
  // Some case payout methods require a receipt or not
  receiptRequired?: boolean
  successMessage?: string
}

// Extend the base interface for 'other' payout method details
export interface IOtherPayoutMethodDetails extends IBasePayoutDetails {
  accountName: string
  accountId?: string
  payoutImg?: string
  payoutUrl?: string
}

export interface IExternalPayoutMethodDetails extends IBasePayoutDetails {
  payoutUrl: string
  payoutImg?: string
}
// Extend the base interface for bank transfer details
export interface IBankTransferDetails extends IBasePayoutDetails {
  accountName: string
  accountId: string
  bankBranch?: string
  bankName?: string
}

export class PayoutPreferenceDto {
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
        accountId: '1234567890',
        bankName: 'HSBC',
        bankBranch: 'HSBC',
        receiptRequired: true,
        successMessage: 'Please wait for the educator to confirm your payment',
      },
      external: {
        accountName: '1234567890',
        accountId: 'payout details: (payment ID or account number)',
        payoutImg: 'http://abcd.com/image_url_Optional',
        payoutUrl: 'http://abcd.com/payment_link_Optional',
        receiptRequired: true,
        successMessage: 'Please wait for the educator to confirm your payment',
      },

      Others: {
        accountName: 'Peter',
        accountId: 'payout details: (payment ID or account number)',
        payoutImg: 'http://abcd.com/url_Optional',
        payoutUrl: 'http://abcd.com/payment_link_Optional',
        receiptRequired: true,
        successMessage: 'Please wait for the educator to confirm your payment',
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

  static example = {
    enabled: true,
    id: 1,
    siteId: 1,
    institutionId: 1,
    description: '',
    methodType: 'bankTransfer',
    methodName: 'methodName',
    payoutMethodDetails: {
      bankName: 'bankName',
      bankBranch: 'bankBranch',
      accountName: 'accountName',
      accountNumber: 'accountNumber',
      receiptRequired: true,
      successMessage: 'Please wait for the educator to confirm your payment',
    },
  }
}

export class BankTransferDetailsDto implements IBankTransferDetails {
  @ApiProperty({
    example: 'Peter',
  })
  @IsNotEmpty()
  accountName: string

  @ApiProperty({
    example: '12345566',
  })
  @IsNotEmpty()
  accountId: string

  @ApiProperty({
    example: '32134412',
  })
  @IsOptional()
  bankBranch?: string

  @ApiProperty({
    example: '32134412',
  })
  @IsOptional()
  bankName?: string
}

export class ExternalPayoutMethodDetailsDto implements IExternalPayoutMethodDetails {
  @ApiProperty({
    example: 'http://abcd.com/url_Optional',
  })
  @IsOptional()
  payoutImg?: string

  @ApiProperty({
    example: 'http://abcd.com/url_Optional',
  })
  @IsNotEmpty()
  payoutUrl: string
}

export class OtherMethodDetailsDto implements IOtherPayoutMethodDetails {
  @ApiProperty({
    example: 'Peter,',
  })
  @IsOptional()
  accountName: string

  @ApiProperty({
    example: 'payout details: (payment ID or account number)',
  })
  @IsOptional()
  accountId: string

  @ApiProperty({
    example: 'http://abcd.com/url_Optional',
  })
  @IsOptional()
  payoutImg?: string

  @ApiProperty({
    example: 'http://abcd.com/url_Optional',
  })
  @IsOptional()
  payoutUrl?: string
}
export class GetPayoutPreferenceDto {
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
