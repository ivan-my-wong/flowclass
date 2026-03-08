import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength, Validate } from 'class-validator'

import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'

export class RegisterSiteDto {
  @ApiProperty({
    example: 'site@gmail.com',
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'pasSw@5d',
  })
  @IsNotEmpty()
  @MinLength(8)
  // @MaxLength(20)
  // @IsStrongPassword()
  @Validate(IsModeratelyStrongPassword)
  password: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  firstName: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  url: string

  @ApiProperty()
  @MaxLength(15)
  @IsOptional()
  phone: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  company: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  position: string

  @ApiProperty()
  @MaxLength(255)
  @IsOptional()
  country: string

  @ApiProperty()
  @IsOptional()
  visibility: string
}
