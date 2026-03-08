import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

import { CreditSourceType } from '@/models/credit-transactions.entity'

export class AddOrDeductCreditDTO {
  @ApiProperty({
    description: 'The ID of the institution',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    description: 'The ID of the user alias',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  userAliasId: number

  @ApiProperty({
    description: 'The amount of credit to add or deduct',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty({
    description: 'The type of credit transaction (e.g., ADD, DEDUCT)',
    enum: CreditSourceType,
  })
  @IsNotEmpty()
  @IsEnum(CreditSourceType)
  sourceType: CreditSourceType

  @ApiProperty({
    description: 'A description for the credit transaction',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string
}
