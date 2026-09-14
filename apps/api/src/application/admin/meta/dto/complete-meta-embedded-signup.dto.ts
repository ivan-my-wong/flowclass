import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CompleteMetaEmbeddedSignupDto {
  @ApiProperty({ description: 'Institution ID associated with this signup' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ description: 'Server-side state token returned during initiate' })
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty({
    description: 'One-time authorization code returned by the Meta Embedded Signup modal',
  })
  @IsString()
  @IsNotEmpty()
  authorizationCode: string

  @ApiProperty({ description: 'WhatsApp Business Account ID returned in session info' })
  @IsString()
  @IsNotEmpty()
  wabaId: string

  @ApiPropertyOptional({ description: 'Business Portfolio ID returned in session info' })
  @IsString()
  @IsOptional()
  businessId?: string

  @ApiPropertyOptional({ description: 'Phone number ID returned in session info' })
  @IsString()
  @IsOptional()
  phoneNumberId?: string
}
