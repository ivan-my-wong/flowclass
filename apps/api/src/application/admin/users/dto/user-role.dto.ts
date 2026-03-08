import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator'

import { RoleInSite } from '@/models/enums/'

@Exclude()
export class UserRoleResponse {
  @Expose()
  email: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  permissions: Permission[]
}

export class Permission {
  @Expose()
  siteId: number

  @Expose()
  institutionId: number

  @Expose()
  isMasterAdmin: boolean

  @Expose()
  isSiteManager: boolean

  @Expose()
  isInstitutionManager: boolean

  @Expose()
  isInstructor: boolean

  @Expose()
  isOperator: boolean
}

export class UpdateUserRoleDto {
  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsNotEmpty()
  email: string

  @ApiProperty({
    enum: RoleInSite,
    default: RoleInSite.SITE_MANAGER,
  })
  @IsEnum(RoleInSite)
  @IsNotEmpty()
  role: RoleInSite
}
