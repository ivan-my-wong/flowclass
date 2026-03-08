import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

import { BaseRegisterDto } from '../../auth/dto/base-register.dto'

export class AcceptInviteSiteMemberDto extends BaseRegisterDto {
  @ApiProperty({ example: '179069b652ca68288ab265fba7e69e90dd879f98' })
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  agree: boolean
}
