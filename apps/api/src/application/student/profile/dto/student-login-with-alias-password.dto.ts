import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class StudentLoginWithAliasPasswordDto {
  @ApiProperty({
    description: 'The phone number of the student',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phone: string

  @ApiProperty({
    description: 'The alias password for the student',
    example: 'StudentPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  aliasPassword: string

  @ApiProperty({
    description: 'The ID of the institution',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    description: 'The name/alias of the student (optional, used for additional verification)',
    example: 'John',
    required: false,
  })
  @IsString()
  name?: string
}
