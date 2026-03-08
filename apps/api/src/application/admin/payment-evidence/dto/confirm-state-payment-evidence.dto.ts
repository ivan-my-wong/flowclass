import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator'

export class ConfirmPaymentWithoutReceiptDTO {
  @ApiProperty()
  @IsNumber()
  invoiceId: number

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  proofToken: string

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsBoolean()
  isSendToParent?: boolean
}

export class ConfirmDeletePaymentWithoutReceiptDTO extends ConfirmPaymentWithoutReceiptDTO {}

export class ConfirmMultiplePaymentEvidenceResponse {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ValidateIf((o) => (o.invoices?.length || 0) <= 0)
  @IsNumber({}, { each: true })
  ids: number[]

  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsArray()
  @ValidateIf((o) => (o.ids?.length || 0) <= 0)
  @ArrayNotEmpty()
  invoices?: ConfirmPaymentWithoutReceiptDTO[]
}

export class RejectMultiplePaymentEvidenceResponse extends ConfirmMultiplePaymentEvidenceResponse {}

export class ResetMultiplePaymentEvidenceResponse extends ConfirmMultiplePaymentEvidenceResponse {}

export class DeleteMultiplePaymentEvidenceResponse extends ConfirmMultiplePaymentEvidenceResponse {
  @ApiProperty()
  @IsArray()
  @ValidateIf((o) => (o.ids?.length || 0) <= 0)
  @ArrayNotEmpty()
  invoices?: ConfirmDeletePaymentWithoutReceiptDTO[]
}

export enum SendPaymentActions {
  SEND_WA_REMINDER = 'resend-wa-payment-reminder',
  SEND_MAIL_REMINDER = 'resend-email-payment-reminder',
  SEND_SUCCESS_PAYMENT = 'resend-success-payment',
  SEND_WA_SUCCESS_PAYMENT = 'resend-wa-success-payment',
  SEND_QR_CODE = 'resend-qr-code',
}

export class SendPaymentProofReminderDTO extends ConfirmMultiplePaymentEvidenceResponse {
  @ApiProperty({
    type: String,
    enum: SendPaymentActions,
    example: SendPaymentActions.SEND_WA_REMINDER,
  })
  @IsNotEmpty()
  action: SendPaymentActions

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  content?: string
}
