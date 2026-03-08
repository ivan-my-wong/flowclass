import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class StudentResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string
}
