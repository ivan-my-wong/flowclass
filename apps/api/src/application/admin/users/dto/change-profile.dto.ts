import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator'

export class ChangeProfileDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  email: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  firstName: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  lastName: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  company: string

  @ApiPropertyOptional({
    example: '',
  })
  @MaxLength(255)
  @IsOptional()
  position: string
}
