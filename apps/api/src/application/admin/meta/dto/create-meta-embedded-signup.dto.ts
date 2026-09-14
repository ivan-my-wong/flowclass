import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class CreateMetaEmbeddedSignupDto {
  @ApiProperty({ description: 'Institution ID for the embedded signup' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({
    description:
      'Whether the signup is for coexistence onboarding (WhatsApp Business mobile app alongside Cloud API)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCoexistence?: boolean
}
