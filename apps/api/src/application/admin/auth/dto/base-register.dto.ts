import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'
import { PhoneNumberRule } from '@/common/validators/phone-number.validator'

export class BaseRegisterDto {
  @ApiProperty({
    example: 'Ron',
  })
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string

  @ApiProperty({
    example: 'Chan',
  })
  @MaxLength(255)
  @IsOptional()
  lastName?: string

  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'pasSw@5d',
  })
  @IsNotEmpty()
  @MinLength(8)
  @Validate(IsModeratelyStrongPassword)
  password: string

  @ApiProperty({
    example: '85277889900',
  })
  @IsNotEmpty()
  @Validate(PhoneNumberRule)
  phone: string // must have a phone
}
