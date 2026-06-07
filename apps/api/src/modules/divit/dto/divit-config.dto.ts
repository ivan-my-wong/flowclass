import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator'

export class SaveDivitConfigDto {
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureKey?: string

  @ApiPropertyOptional({ enum: ['sandbox', 'production'] })
  @IsOptional()
  @IsIn(['sandbox', 'production'])
  environment?: 'sandbox' | 'production'

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class DivitConfigResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  institutionId: number

  @ApiProperty()
  siteId: number

  @ApiProperty({ description: 'Masked — last 6 chars only' })
  apiKeyMasked: string | null

  @ApiProperty({ description: 'Masked — last 6 chars only' })
  signatureKeyMasked: string | null

  @ApiProperty({ enum: ['sandbox', 'production'] })
  environment: 'sandbox' | 'production'

  @ApiProperty()
  enabled: boolean
}
