import { Transform } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator'

import { GoogleServiceType } from '@/models/integration-google.entity'

export class GetGoogleAuthUrlDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter(Boolean)
    }
    if (typeof value === 'string') {
      const parts = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return parts
    }
    return []
  })
  scopes: string[]

  @IsEnum(GoogleServiceType)
  serviceType: GoogleServiceType

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    allow_underscores: true,
  })
  redirectUri?: string
}
