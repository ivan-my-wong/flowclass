import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator'

export class StudentChangeAliasPasswordDto {
  @ApiProperty({
    description:
      "The ID of the user alias whose password should be changed. Can be the user's own alias or their child's alias.",
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    description: 'The current alias password',
    example: 'CurrentPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  currentAliasPassword: string

  @ApiProperty({
    description:
      'The new alias password. Must be 8-20 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/, {
    message:
      'Password must be 8-20 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  newAliasPassword: string
}
