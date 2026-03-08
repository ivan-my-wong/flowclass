import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class SiteDetailDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  name: string

  @ApiPropertyOptional()
  @Expose()
  description: string

  @ApiPropertyOptional()
  @Expose()
  url: string

  @ApiPropertyOptional()
  @Expose()
  siteAdmin: number

  @ApiPropertyOptional()
  @Expose()
  email: string

  @ApiPropertyOptional()
  @Expose()
  phone: string

  @ApiPropertyOptional()
  @Expose()
  logo: string

  @ApiPropertyOptional()
  @Expose()
  banner: string

  @ApiPropertyOptional()
  @Expose()
  subscription: string

  @ApiPropertyOptional()
  @Expose()
  country: string

  @ApiPropertyOptional()
  @Expose()
  currency: string

  @ApiPropertyOptional()
  @Expose()
  language: string

  @ApiPropertyOptional()
  @Expose()
  timeZone: any

  @ApiPropertyOptional()
  @Expose()
  defaultInstitutionId: number

  @ApiPropertyOptional()
  @Expose()
  customDomain: string
}

export class SiteRegionDto {
  @ApiPropertyOptional()
  @Expose()
  country: string

  @ApiPropertyOptional()
  @Expose()
  currency: string

  @ApiPropertyOptional()
  @Expose()
  language: string
}
