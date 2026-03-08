import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

export class StudentUpdateUserDto {
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
  country: string

  @ApiPropertyOptional({
    example: null,
  })
  @IsOptional()
  visibility: string
}
