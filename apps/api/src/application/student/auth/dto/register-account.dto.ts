import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

export class StudentRegisterAccountDto {
  @ApiProperty({
    example: 'Ron',
  })
  @MaxLength(255)
  firstName: string

  @ApiProperty({
    example: 'Chan',
  })
  @MaxLength(255)
  lastName: string

  @ApiProperty({
    example: '85239428934',
  })
  phone: string

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
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  password: string
}
