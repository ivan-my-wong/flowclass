import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

import { MetaEmbeddedSignupStatus } from '@/models/meta-embedded-signup.entity'

export class UpdateMetaEmbeddedSignupDto {
  @ApiPropertyOptional({ description: 'Institution ID' })
  @IsNumber()
  @IsOptional()
  institutionId: number

  @ApiPropertyOptional({ description: 'Meta Business ID' })
  @IsString()
  @IsOptional()
  businessId?: string

  @ApiPropertyOptional({ description: 'Meta Configuration ID' })
  @IsString()
  @IsOptional()
  configurationId?: string

  @ApiPropertyOptional({ description: 'Embedded signup state' })
  @IsString()
  @IsOptional()
  embeddedSignupState?: string

  @ApiPropertyOptional({ description: 'Granted scopes array' })
  @IsArray()
  @IsOptional()
  grantedScopes?: string[]

  @ApiPropertyOptional({ description: 'Is coexistence signup' })
  @IsBoolean()
  @IsOptional()
  isCoexistence?: boolean

  @ApiPropertyOptional({ enum: MetaEmbeddedSignupStatus })
  @IsEnum(MetaEmbeddedSignupStatus)
  @IsOptional()
  status?: MetaEmbeddedSignupStatus
}
