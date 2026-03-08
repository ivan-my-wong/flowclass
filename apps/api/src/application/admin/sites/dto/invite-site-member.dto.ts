import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator'

import { InstitutionExistsRule } from '@/common/validators/institution-exists.validator'
import { PhoneNumberRule } from '@/common/validators/phone-number.validator'
import { SiteExistsRule } from '@/common/validators/site-exists.validator'
import { RoleInSite } from '@/models/enums/'

export class InviteSiteMemberDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'Flowclass',
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: '1234567890',
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  @Validate(PhoneNumberRule, { message: 'Invalid phone number' })
  phone: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(SiteExistsRule, { message: "doesn't exist" })
  siteId: number

  @ApiProperty({
    example: [
      {
        siteId: 1,
        institutionId: 1,
        role: RoleInSite.INSTITUTION_MANAGER,
      },
      {
        siteId: 1,
        institutionId: 2,
        role: RoleInSite.INSTRUCTOR,
      },
    ],
  })
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => InviteToInstitutionAndRoleDto)
  institutions: InviteToInstitutionAndRoleDto[]
}

export class InviteToInstitutionAndRoleDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Validate(SiteExistsRule, { message: "doesn't exist" })
  siteId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Validate(InstitutionExistsRule, { message: "doesn't exist" })
  institutionId: number

  @ApiProperty({
    example: RoleInSite.INSTRUCTOR,
    description: "role: 'site-manager', 'institution-manager', 'instructor', 'operator'",
  })
  @IsEnum(RoleInSite, {
    message:
      "wrong role it must to be on of ('site-manager', 'institution-manager', 'instructor', 'operator')",
  })
  @IsNotEmpty({
    message:
      "wrong role it must to be on of ('site-manager', 'institution-manager', 'instructor', 'operator')",
  })
  role: RoleInSite
}
