import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

import { ResponseUserDto } from './response-user.dto'

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: '!Flowclasstest123456',
  })
  @IsNotEmpty()
  @MaxLength(40)
  password: string
}

export class CreateLoginTokenDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class LoginWithTokenDto {
  @ApiProperty({
    example: 'jwt token',
  })
  @IsNotEmpty()
  token: string
}

@Exclude()
export class LoginResponse {
  user: ResponseUserDto

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjdW9uZ2xoMUBnbWFpbC5jb20iLCJsYXN0TmFtZSI6IkN1b25nIiwiZmlyc3ROYW1lIjoiTGUiLCJpYXQiOjE2NzcxMjg4MDQsImV4cCI6MTY3NzIxNTIwNH0.OvOOAAPmniPJ0RSeeLM3gAUQMrKhmzw5tOTWdUDhIxE',
  })
  @Expose()
  accessToken: string

  @Expose()
  refreshToken: string
}

export class ValidateTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjdW9uZ2xoMUBnbWFpbC5jb20iLCJsYXN0TmFtZSI6IkN1b25nIiwiZmlyc3ROYW1lIjoiTGUiLCJpYXQiOjE2NzcxMjg4MDQsImV4cCI6MTY3NzIxNTIwNH0.OvOOAAPmniPJ0RSeeLM3gAUQMrKhmzw5tOTWdUDhIxE',
  })
  @IsString()
  token: string
}
