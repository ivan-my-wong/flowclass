import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class StudentParamForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0ZXN0c3NAc2N1dGkuYXNpYSIsImxhc3ROYW1lIjoiMTIzIiwiZmlyc3ROYW1lIjoic3RyaW5ncyIsImlhdCI6MTY3NzYzNzA1MiwiZXhwIjoxNjc3NzIzNDUyfQ.nd-iUvZS53zKs1Ahf5vnWEb0GEAj3kb5lcGMNG9KPIs',
  })
  @IsNotEmpty()
  token: string
}
