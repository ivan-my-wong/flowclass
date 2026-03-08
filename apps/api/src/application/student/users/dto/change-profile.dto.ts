import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator'

export class StudentChangeProfileDto {
  @ApiPropertyOptional({
    example: 'flowclass@gmail.com',
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

  @ApiPropertyOptional({
    example: null,
  })
  @MaxLength(255)
  @IsOptional()
  social: string

  @ApiProperty({
    example: '',
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsOptional()
  country: string

  @ApiPropertyOptional({
    example: null,
  })
  @IsOptional()
  visibility: string
}
