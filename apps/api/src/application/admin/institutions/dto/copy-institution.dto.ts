import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber } from 'class-validator'

export class CopyInstitutionDto {
  @ApiProperty({ example: 'john@example.com', required: true })
  @IsEmail()
  email: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  institutionId: number
}
