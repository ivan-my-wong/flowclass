import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateMetaWhatsAppProfileDto {
  @ApiPropertyOptional({ description: 'About text (max 139 characters)' })
  @IsString()
  @MaxLength(139)
  @IsOptional()
  about?: string

  @ApiPropertyOptional({ description: 'Business address (max 256 characters)' })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  address?: string

  @ApiPropertyOptional({ description: 'Business description (max 512 characters)' })
  @IsString()
  @MaxLength(512)
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ description: 'Contact email (max 128 characters)' })
  @IsEmail()
  @MaxLength(128)
  @IsOptional()
  email?: string

  @ApiPropertyOptional({ description: 'List of business website URLs (up to 2 websites)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  websites?: string[]

  @ApiPropertyOptional({ description: 'Industry vertical' })
  @IsString()
  @IsOptional()
  vertical?: string
}
