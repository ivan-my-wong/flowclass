import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MinLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

export class StudentForgotPasswordDto {
  @ApiProperty({
    example: 'newFlowclass@2023',
  })
  @IsNotEmpty()
  @MinLength(8)
  // @MaxLength(20)
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  password: string

  @ApiProperty({
    example: 'newFlowclass@2023',
  })
  @IsNotEmpty()
  @MinLength(8)
  // @MaxLength(20)
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  passwordConfirm: string
}
