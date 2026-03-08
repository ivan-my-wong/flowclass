import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsOptional, MaxLength, ValidateNested } from 'class-validator'

import { CreateUserRoleDto } from './create-user.dto'

export class UpdateUserPermissionDto {
  @ApiPropertyOptional({
    example: [],
  })
  @IsOptional()
  @Type(() => CreateUserRoleDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  permissions: CreateUserRoleDto[]
}

export class UpdateUserDto {
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
  @MaxLength(255)
  @IsOptional()
  email: string

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
  @IsOptional()
  country: string

  @ApiPropertyOptional({
    example: null,
  })
  @IsOptional()
  visibility: string

  @ApiPropertyOptional({
    example: null,
  })
  @IsOptional()
  avatarUrl: string
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: '',
  })
  @Type(() => UpdateUserDto)
  @ValidateNested()
  @IsOptional()
  user: UpdateUserDto

  @ApiPropertyOptional({
    example: [],
  })
  @IsOptional()
  @Type(() => CreateUserRoleDto)
  @ValidateNested()
  permissions: CreateUserRoleDto
}
