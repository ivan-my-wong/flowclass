import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  MaxLength,
  Validate,
} from 'class-validator'

import { InstitutionExistsRule } from '@/common/validators/institution-exists.validator'
import { SiteExistsRule } from '@/common/validators/site-exists.validator'
import { UserExistsRule } from '@/common/validators/user-exists.validator'
import { LongDescription } from '@/models/courses.entity'
import { PhoneContactMethod, RoleInInstitution, StudentPrimaryIdentifier } from '@/models/enums/'
import { addressDetail } from '@/models/institutions.entity'

export class CreateInstitutionDto {
  @ApiProperty({
    example: 'Institution name',
  })
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: [
      {
        sectionTitle: 'Section title',
        content: 'Section content',
      },
    ],
  })
  @Type(() => LongDescription)
  @IsOptional()
  description?: LongDescription[]

  @ApiPropertyOptional({ example: addressDetail.example })
  @Type(() => addressDetail)
  @IsOptional()
  address?: addressDetail

  @ApiPropertyOptional({
    example: 'Institution phone number',
  })
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({
    example: 'Institution banner image',
  })
  @IsOptional()
  bannerImage?: string

  @ApiPropertyOptional({
    example: 'Institution website',
  })
  @IsOptional()
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[\w\-_]+$/)
  url?: string

  @ApiPropertyOptional({
    example: 'Institution logo',
  })
  @IsOptional()
  logo?: string

  @ApiPropertyOptional({
    example: 'institution@domain.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  contactPerson?: number

  @ApiPropertyOptional({
    example: 'Institution subscription',
  })
  @IsOptional()
  subscription?: string

  @ApiPropertyOptional()
  @IsOptional()
  videoUrl?: string

  @ApiPropertyOptional({
    description: 'New file you want to add',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  files?: any[]

  @ApiProperty()
  @IsNotEmpty()
  siteId: number

  @ApiProperty()
  @IsOptional()
  aiCredit?: number

  @ApiProperty()
  @IsOptional()
  aiCreditMax?: number
}

export class UpdateInstitutionDto {
  @ApiProperty({
    example: 'Institution name',
  })
  @IsOptional()
  name?: string

  @ApiPropertyOptional({
    example: [
      {
        sectionTitle: 'Section title',
        content: 'Section content',
      },
    ],
  })
  @Type(() => LongDescription)
  @IsOptional()
  description?: LongDescription[]

  @ApiPropertyOptional({ example: addressDetail.example })
  @Type(() => addressDetail)
  @IsOptional()
  address?: addressDetail

  @ApiPropertyOptional({
    example: 'Institution phone number',
  })
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({
    example: 'Institution banner image',
  })
  @IsOptional()
  bannerImage?: string

  @ApiPropertyOptional({
    example: 'Institution website',
  })
  @IsOptional()
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[\w\-_]+$/)
  url?: string

  @ApiPropertyOptional({
    example: 'Institution logo',
  })
  @IsOptional()
  logo?: string

  @ApiPropertyOptional({
    example: 'institution@domain.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  contactPerson?: number

  @ApiPropertyOptional({
    example: 'Institution subscription',
  })
  @IsOptional()
  subscription?: string

  @ApiPropertyOptional()
  @IsOptional()
  videoUrl?: string

  @ApiPropertyOptional({
    description: 'New file you want to add',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  files?: any[]

  @ApiPropertyOptional({
    description: 'List ids of media want to delete',
    example: '14,15',
  })
  @IsOptional()
  deleteFiles?: string

  @ApiPropertyOptional({})
  @IsOptional()
  listFileDelete?: string[]

  @ApiPropertyOptional({})
  @IsOptional()
  courseOrder?: number[]

  @ApiPropertyOptional({})
  @IsOptional()
  phoneContactMethod?: PhoneContactMethod

  @ApiPropertyOptional({})
  @IsOptional()
  contactId?: string

  @ApiPropertyOptional({})
  @IsOptional()
  studentPrimaryIdentifier?: StudentPrimaryIdentifier
}

export class InviteInstitutionMemberDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(SiteExistsRule, { message: "doesn't exist" })
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(InstitutionExistsRule, { message: "doesn't exist" })
  institutionId: number

  @ApiProperty({
    example: RoleInInstitution.INSTRUCTOR,
    description: "role: 'institution-manager', 'instructor', 'operator'",
  })
  @IsEnum(RoleInInstitution, {
    message: "wrong role it must to be on of ('institution-manager', 'instructor', 'operator')",
  })
  @IsNotEmpty({
    message: "wrong role it must to be on of ('institution-manager', 'instructor', 'operator')",
  })
  role: RoleInInstitution
}

export class RemoveInstitutionMemberDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(InstitutionExistsRule, { message: "doesn't exist" })
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(UserExistsRule, { message: "doesn't exist" })
  userId: number
}
