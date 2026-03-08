import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string
}

export class ChangeOtherUserPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string

  @ApiProperty({
    example: 'newFlowclass@2023',
  })
  @IsNotEmpty()
  @MinLength(8)
  @Validate(IsModeratelyStrongPassword)
  password: string
}
