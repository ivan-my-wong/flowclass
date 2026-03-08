import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator'

export class UpdateCreditSettingsDTO {
  @ApiProperty({
    description: 'Indicates whether the credit system is enabled',
    required: false,
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean

  @ApiProperty({
    description: 'Conversion rate from credits to currency',
    required: false,
    type: Number,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  conversionRate?: number

  @ApiProperty({
    description: 'ISO 4217 currency code (e.g., USD, EUR)',
    required: false,
    type: String,
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string
}
