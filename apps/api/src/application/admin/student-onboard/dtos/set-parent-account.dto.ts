import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator'

export class SetParentAccountDto {
  @ApiProperty({
    description: 'Indicates whether the user is a parent or not',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isParent: boolean

  @ApiProperty({
    description: 'The ID of the user alias to set as a parent account',
    type: Number,
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  userAliasId: number

  @ApiProperty({
    description: 'The ID of the institution to which the parent account belongs',
    type: Number,
    example: 456,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number
}
