import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator'

import { VALID_CUSTOM_DOMAIN_PATTERN, VALID_DOMAIN_PATTERN } from '@/common/constants'
import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

import { InstitutionDetailDto } from '../../institutions/dto/institution-detail.dto'

import { SiteDetailDto } from './site-detail.dto'

export class CreateSiteDto {
  @ApiProperty()
  @MaxLength(255)
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  description: string

  @ApiPropertyOptional()
  @MaxLength(255)
  @IsOptional()
  email: string

  @ApiPropertyOptional()
  @MaxLength(255)
  @IsOptional()
  phone: string

  @ApiPropertyOptional()
  @MaxLength(255)
  @IsOptional()
  logo: string

  @ApiPropertyOptional()
  @MaxLength(255)
  @IsOptional()
  banner: string

  @ApiPropertyOptional()
  @MaxLength(255)
  @Matches(VALID_DOMAIN_PATTERN)
  @IsNotEmpty()
  url: string

  @ApiPropertyOptional()
  @IsOptional()
  siteAdmin: number

  @ApiPropertyOptional()
  @MaxLength(255)
  @IsOptional()
  subscription: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defaultInstitutionId: number

  @ApiPropertyOptional()
  @MaxLength(255)
  @Matches(VALID_CUSTOM_DOMAIN_PATTERN, { message: 'Invalid custom domain' })
  @IsOptional()
  customDomain?: string
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  // @MaxLength(20)
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  password: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  firstName: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  domainName: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(15)
  @IsOptional()
  phone: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  company: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  position: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsNotEmpty()
  social: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsNotEmpty()
  country: string

  @ApiProperty({
    example: '[1,10)',
  })
  @IsOptional()
  visibility: string
}

export class StoreSiteDto {
  @ApiProperty({
    example: {
      name: 'Google',
      description: 'Search Tool',
      domainName: 'google.com',
      email: 'site@gmail.com',
      phone: '0987654321',
      logo: 'your logo',
      banner: 'your banner',
    },
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSiteDto)
  site: CreateSiteDto

  @ApiProperty({
    example: {
      email: 'site-manager@gmail.com',
      password: 'SecurePassword123!',
      firstName: 'Site',
      lastName: 'Manager',
      phone: '0987654321',
      company: 'other',
      position: 'Site Manager',
      social: { name: 'SocialName' },
      country: 'Earth',
      visibility: '(0,20)',
      domainName: 'google.com',
    },
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto
}

@Exclude()
export class SiteResponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  name: string

  @ApiProperty()
  @Expose()
  description: string

  @ApiProperty()
  @Expose()
  email: string

  @ApiProperty()
  @Expose()
  phone: string

  @ApiProperty()
  @Expose()
  logo: string

  @ApiProperty()
  @Expose()
  banner: string

  @ApiProperty()
  @Expose()
  url: string

  @ApiProperty()
  @Expose()
  siteAdmin: number

  @ApiProperty()
  @Expose()
  subscription: string

  @ApiProperty()
  @Expose()
  country: string

  @ApiProperty()
  @Expose()
  currency: string

  @ApiProperty()
  @Expose()
  language: string

  @ApiProperty()
  @Expose()
  defaultInstitutionId: number
}

@Exclude()
export class RegisterSiteResponse extends SiteDetailDto {
  @ApiProperty()
  @Expose()
  institution: InstitutionDetailDto
}

@Exclude()
export class UserResponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  email: string

  @ApiPropertyOptional()
  @Expose()
  firstName: string

  @ApiPropertyOptional()
  @Expose()
  lastName: string

  @ApiPropertyOptional()
  @Expose()
  isEmailVerified: boolean

  @ApiPropertyOptional()
  @Expose()
  phone: string

  @ApiPropertyOptional()
  @Expose()
  lastActiveTime: Date

  @ApiPropertyOptional()
  @Expose()
  avatarUrl: string

  @ApiPropertyOptional()
  @Expose()
  company: string

  @ApiPropertyOptional()
  @Expose()
  position: string

  @ApiPropertyOptional()
  @Expose()
  social: string

  @ApiPropertyOptional()
  @Expose()
  country: string

  @ApiPropertyOptional()
  @Expose()
  deletedAt: Date

  @ApiPropertyOptional()
  @Expose()
  visibility: string
}

@Exclude()
export class InstitutionResponse {
  @ApiProperty()
  @Expose()
  id: number
}

@Exclude()
export class CreateSiteResponse {
  @ApiProperty()
  @Expose()
  site: SiteResponse

  @ApiProperty()
  @Expose()
  user: UserResponse

  @ApiProperty()
  @Expose()
  institution: InstitutionResponse
}
