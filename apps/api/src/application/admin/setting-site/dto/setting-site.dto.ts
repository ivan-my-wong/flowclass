import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class SettingSiteDto {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  language: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  timeZone: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  currency: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  domain: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  country: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  countryCode: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  displayEmailLogo: boolean
}

export class CreateSettingSiteDto extends SettingSiteDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  siteId: number
}

export class UpdateSettingSiteDto extends SettingSiteDto {}

export class UpdateDisplayEmailLogoDto {
  @ApiPropertyOptional({
    example: false,
  })
  @IsBoolean()
  displayEmailLogo: boolean
}

export class UpdateDisplayEmailLogoQueryDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  siteId: number
}
