import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'Flowclass@2023',
  })
  @IsNotEmpty()
  @MinLength(8)
  // @MaxLength(20)
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  password: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  firstName: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  lastName: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(15)
  @IsOptional()
  phone: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  company: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  position: string

  @ApiPropertyOptional({
    example: null,
  })
  @MaxLength(255)
  @IsOptional()
  social: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsNotEmpty()
  country: string

  @ApiPropertyOptional({
    example: null,
  })
  @IsOptional()
  visibility: string
}

export class CreateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  userId: number

  @ApiProperty()
  @IsOptional()
  isMasterAdmin: boolean

  @ApiProperty()
  @IsOptional()
  isSiteManager: boolean

  @ApiProperty()
  @IsOptional()
  isInstitutionManager: boolean

  @ApiProperty()
  @IsOptional()
  isInstructor: boolean

  @ApiProperty()
  @IsOptional()
  isOperator: boolean

  @ApiProperty()
  @IsOptional()
  isStudent: boolean
}
