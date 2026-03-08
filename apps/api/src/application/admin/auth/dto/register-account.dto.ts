import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { BaseRegisterDto } from './base-register.dto'

export class RegisterAccountDto extends BaseRegisterDto {
  @ApiProperty({
    example: '85277889900',
  })
  @IsNotEmpty()
  phone: string
}
