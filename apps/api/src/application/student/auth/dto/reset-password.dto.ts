import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class StudentResetPasswordDto {
  @ApiProperty({
    example: 'flowclass@gmail.com',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string
}
