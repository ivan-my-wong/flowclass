import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator'

export class ChangeAliasPasswordDto {
  @ApiProperty({
    description: 'The ID of the user alias whose password should be changed',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    description:
      'The new password for the user alias. Must be 8-20 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
    example: 'newAliasPassword123!',
    minLength: 8,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?![.\n]).{8,20}$/, {
    message: 'Password must be 8-20 characters,cannot start with a dot or new line',
  })
  newAliasPassword: string
}
