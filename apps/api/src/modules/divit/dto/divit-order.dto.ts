import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class CreateDivitOrderDto {
  @ApiProperty({ description: 'Invoice ID to pay' })
  @IsNumber()
  invoiceId: number
}

export class DivitOrderResponseDto {
  @ApiProperty()
  redirectUrl: string

  @ApiProperty()
  invoiceId: number

  @ApiProperty()
  divitOrderId: string
}

export class DivitPaymentStatusDto {
  @ApiProperty()
  paid: boolean

  @ApiProperty()
  status: string
}
