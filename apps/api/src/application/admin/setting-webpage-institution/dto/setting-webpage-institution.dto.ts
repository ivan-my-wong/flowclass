import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'

import { TextVersion, WebsiteTemplate } from '@/models/enums'
import { SocialMedia } from '@/models/setting-webpage-institutions.entity'
export class SettingWebpageInstitutionDto {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  bannerImage: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  name: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  themeColor: string

  @ApiPropertyOptional({
    example: WebsiteTemplate.Hero,
  })
  @IsOptional()
  templates: WebsiteTemplate

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  secondaryColor: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  highlightColor: string

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  email: string

  @ApiPropertyOptional({
    example: [SocialMedia.example],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialMedia)
  socialMedia: SocialMedia[]

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  termsCondition: string

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  studentLogin: boolean

  @ApiPropertyOptional({
    example: TextVersion.SCHOOL,
    enum: TextVersion,
  })
  @IsOptional()
  @IsEnum(TextVersion)
  textVersion: TextVersion
}

export class CreateSettingWebpageInstitutionDto extends SettingWebpageInstitutionDto {
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  institutionId: number
}

export class UpdateSettingWebpageInstitutionDto extends SettingWebpageInstitutionDto {}

export class TextVersionResponseDto {
  @ApiProperty({
    description: 'Text version of the webpage',
    type: String,
    nullable: true,
    example: TextVersion.SCHOOL,
  })
  textVersion: TextVersion | null
}
